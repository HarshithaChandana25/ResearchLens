from paper_manager import supabase


def check_duplicate_paper(title, doi=None):
    try:
        if not title.strip():
            print("\nPaper title cannot be empty.")
            return None

        duplicates = {}

        # Check for an existing paper with the same title
        title_response = (
            supabase.table("papers")
            .select("*")
            .ilike("title", title.strip())
            .execute()
        )

        for paper in title_response.data:
            duplicates[paper["id"]] = paper

        # Check DOI if provided
        if doi and doi.strip():
            doi_response = (
                supabase.table("papers")
                .select("*")
                .ilike("doi", doi.strip())
                .execute()
            )

            for paper in doi_response.data:
                duplicates[paper["id"]] = paper

        duplicate_list = list(duplicates.values())

        if duplicate_list:
            print("\n===== DUPLICATE PAPERS FOUND =====")

            for paper in duplicate_list:
                print("\nTitle:", paper["title"])
                print("Authors:", paper["authors"])
                print("DOI:", paper["doi"])
                print("Paper ID:", paper["id"])
                print("--------------------------------")

            return duplicate_list

        print("\nNo duplicate paper found.")
        return []

    except Exception as error:
        print("\nUnable to check duplicate papers:")
        print(error)
        return None