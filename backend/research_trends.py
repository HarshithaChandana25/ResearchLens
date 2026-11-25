from paper_manager import supabase
import matplotlib.pyplot as plt
import pandas as pd


def get_research_trends():
    try:
        response = (
            supabase.table("papers")
            .select("title, authors, publication_year, journal, abstract")
            .execute()
        )

        papers = response.data

        if not papers:
            print("No research papers found.")
            return []

        print("\n===== RESEARCH TRENDS ANALYSIS =====")

        year_counts = {}

        for paper in papers:
            year = paper.get("publication_year")

            if year:
                year_counts[year] = year_counts.get(year, 0) + 1

        print("\nPublications by Year:")

        for year in sorted(year_counts):
            print(year, ":", year_counts[year], "paper(s)")

        # Publication year chart
        if year_counts:
            plt.figure(figsize=(8, 5))
            plt.bar(year_counts.keys(), year_counts.values())
            plt.title("Research Publications by Year")
            plt.xlabel("Publication Year")
            plt.ylabel("Number of Papers")
            plt.tight_layout()
            plt.show()

        journal_counts = {}

        for paper in papers:
            journal = paper.get("journal")

            if journal:
                journal_counts[journal] = journal_counts.get(journal, 0) + 1

        print("\nPublications by Journal:")

        for journal, count in journal_counts.items():
            print(journal, ":", count, "paper(s)")

        # Journal publication chart
        if journal_counts:
            plt.figure(figsize=(8, 5))
            plt.bar(journal_counts.keys(), journal_counts.values())
            plt.title("Research Publications by Journal")
            plt.xlabel("Journal")
            plt.ylabel("Number of Papers")
            plt.xticks(rotation=45, ha="right")
            plt.tight_layout()
            plt.show()

        return papers

    except Exception as error:
        print("Unable to analyze research trends:", error)
        return None