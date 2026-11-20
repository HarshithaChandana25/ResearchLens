
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)


def login_user(email, password):
    response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    return response.user


def save_paper(user_id, paper_id):
    try:
        data = {
            "user_id": user_id,
            "paper_id": paper_id
        }

        response = supabase.table("saved_papers").insert(data).execute()

        print("\nPaper saved successfully!")
        return response.data

    except Exception as error:
        print("\nUnable to save paper:")
        print(error)
        return None

def view_saved_papers(user_id):
    try:
        response = (
            supabase.table("saved_papers")
            .select("paper_id, saved_at, papers(*)")
            .eq("user_id", user_id)
            .execute()
        )

        print("\n===== YOUR SAVED RESEARCH PAPERS =====")

        if not response.data:
            print("No saved papers found.")
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
        print("Unable to retrieve saved papers:")
        print(error)
        return None
