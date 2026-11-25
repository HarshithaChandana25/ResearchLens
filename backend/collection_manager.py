from paper_manager import supabase


def create_collection(user_id, collection_name, description=""):
    try:
        data = {
            "user_id": user_id,
            "collection_name": collection_name,
            "description": description
        }

        response = supabase.table("collections").insert(data).execute()

        print("\nCollection created successfully!")
        return response.data

    except Exception as error:
        print("\nUnable to create collection:")
        print(error)
        return None
def view_collections(user_id):
    try:
        response = (
            supabase.table("collections")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        print("\n===== YOUR RESEARCH COLLECTIONS =====")

        if not response.data:
            print("No collections found.")
            return []

        for collection in response.data:
            print("\nCollection:", collection["collection_name"])
            print("Description:", collection["description"])
            print("Collection ID:", collection["id"])
            print("--------------------------------")

        return response.data

    except Exception as error:
        print("\nUnable to retrieve collections:")
        print(error)
        return None
def add_paper_to_collection(collection_id, paper_id):
    try:
        data = {
            "collection_id": collection_id,
            "paper_id": paper_id
        }

        response = supabase.table("collection_papers").insert(data).execute()

        print("\nPaper added to collection successfully!")
        return response.data

    except Exception as error:
        print("\nUnable to add paper to collection:")
        print(error)
        return None

def view_papers_in_collection(collection_id):
    try:
        response = (
            supabase.table("collection_papers")
            .select("paper_id, added_at, papers(*)")
            .eq("collection_id", collection_id)
            .execute()
        )

        print("\n===== PAPERS IN THIS COLLECTION =====")

        if not response.data:
            print("No papers found in this collection.")
            return []

        for item in response.data:
            paper = item.get("papers")

            if paper:
                print("\nTitle:", paper["title"])
                print("Authors:", paper["authors"])
                print("Year:", paper["publication_year"])
                print("Journal:", paper["journal"])
                print("Paper ID:", paper["id"])
                print("--------------------------------")

        return response.data

    except Exception as error:
        print("\nUnable to view papers in collection:")
        print(error)
        return None

def remove_paper_from_collection(collection_id, paper_id):
    try:
        response = supabase.table("collection_papers") \
            .delete() \
            .eq("collection_id", collection_id) \
            .eq("paper_id", paper_id) \
            .execute()

        print("\nPaper removed from collection successfully!")

        return response

    except Exception as e:
        print("Error removing paper from collection:", e)
        return None