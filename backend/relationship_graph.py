import networkx as nx
import matplotlib.pyplot as plt
from paper_manager import supabase


def get_relationship_graph():
    try:
        response = (
            supabase.table("paper_relationships")
            .select("source_paper_id, target_paper_id, relationship_type, description")
            .execute()
        )

        relationships = response.data

        if not relationships:
            print("No paper relationships found.")
            return []

        paper_ids = set()

        for relationship in relationships:
            paper_ids.add(relationship["source_paper_id"])
            paper_ids.add(relationship["target_paper_id"])

        paper_response = (
            supabase.table("papers")
            .select("id, title")
            .execute()
        )

        paper_titles = {
            paper["id"]: paper["title"]
            for paper in paper_response.data
        }

        graph = nx.DiGraph()

        for paper_id in paper_ids:
            graph.add_node(
                paper_id,
                label=paper_titles.get(paper_id, "Unknown Paper")
            )

        for relationship in relationships:
            graph.add_edge(
                relationship["source_paper_id"],
                relationship["target_paper_id"],
                label=relationship["relationship_type"]
            )

        plt.figure(figsize=(12, 8))

        positions = nx.spring_layout(graph, seed=42)

        labels = {
            node: paper_titles.get(node, "Unknown Paper")
            for node in graph.nodes()
        }

        nx.draw(
            graph,
            positions,
            labels=labels,
            with_labels=True,
            node_size=3500,
            node_color="lightblue",
            font_size=8,
            font_weight="bold",
            arrows=True
        )

        edge_labels = nx.get_edge_attributes(graph, "label")

        nx.draw_networkx_edge_labels(
            graph,
            positions,
            edge_labels=edge_labels,
            font_size=9
        )

        plt.title("Research Paper Relationship Graph")
        plt.axis("off")
        plt.tight_layout()
        plt.show()

        print("\nResearch relationship graph generated successfully!")

        return relationships

    except Exception as error:
        print("Unable to generate relationship graph:", error)
        return None