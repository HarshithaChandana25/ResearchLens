
import csv
from paper_manager import supabase


def export_papers_to_csv(filename="research_papers.csv"):
    try:
        response = (
            supabase.table("papers")
            .select("*")
            .execute()
        )

        papers = response.data

        if not papers:
            print("No research papers found to export.")
            return False

        with open(filename, "w", newline="", encoding="utf-8") as csvfile:
            fieldnames = papers[0].keys()

            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(papers)

        print("\nCSV Export Successful!")
        print("Exported", len(papers), "research paper(s).")
        print("File saved as:", filename)

        return True

    except Exception as error:
        print("CSV Export Failed:", error)
        return False
