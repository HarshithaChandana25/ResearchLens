from paper_manager import supabase


def add_relationship(
    source_paper_id,
    target_paper_id,
    relationship_type,
    description
):
    try:
        if source_paper_id == target_paper_id:
            print("\nA paper cannot have a relationship with itself.")
            return None

        data = {
            "source_paper_id": source_paper_id,
            "target_paper_id": target_paper_id,
            "relationship_type": relationship_type,
            "description": description
        }

        response = (
            supabase.table("paper_relationships")
            .insert(data)
            .execute()
        )

        print("\nPaper relationship added successfully!")
        return response.data

    except Exception as error:
        print("\nUnable to add paper relationship:")
        print(error)
        return None

def view_relationships():
    try:
        response = (
            supabase.table("paper_relationships")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        print("\n===== RESEARCH PAPER RELATIONSHIPS =====")

        if not response.data:
            print("No paper relationships found.")
            return []

        for relationship in response.data:
            print("\nRelationship ID:", relationship["id"])
            print("Source Paper ID:", relationship["source_paper_id"])
            print("Target Paper ID:", relationship["target_paper_id"])
            print("Relationship Type:", relationship["relationship_type"])
            print("Description:", relationship["description"])
            print("Created At:", relationship["created_at"])
            print("--------------------------------")

        return response.data

    except Exception as error:
        print("\nUnable to view paper relationships:")
        print(error)
        return None