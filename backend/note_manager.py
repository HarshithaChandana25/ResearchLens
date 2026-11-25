from paper_manager import supabase  
def add_note(user_id, paper_id, note_title, note_content):
    try:
        data = {
            "user_id": user_id,
            "paper_id": paper_id,
            "note_title": note_title,
            "note_content": note_content
        }

        response = supabase.table("notes").insert(data).execute()

        print("\nNote added successfully!")

        return response.data

    except Exception as error:
        print("\nUnable to add note:")
        print(error)
        return None
def view_notes(user_id, paper_id):
    try:
        response = (
            supabase.table("notes")
            .select("*")
            .eq("user_id", user_id)
            .eq("paper_id", paper_id)
            .order("created_at", desc=True)
            .execute()
        )

        print("\n===== RESEARCH PAPER NOTES =====")

        if not response.data:
            print("No notes found for this paper.")
            return []

        for note in response.data:
            print("\nNote Title:", note["note_title"])
            print("Note Content:", note["note_content"])
            print("Note ID:", note["id"])
            print("Created At:", note["created_at"])
            print("--------------------------------")

        return response.data

    except Exception as error:
        print("\nUnable to view notes:")
        print(error)
        return None

def delete_note(user_id, note_id):
    try:
        response = (
            supabase.table("notes")
            .delete()
            .eq("user_id", user_id)
            .eq("id", note_id)
            .execute()
        )

        if response.data:
            print("\nNote deleted successfully!")
        else:
            print("\nNo matching note found.")

        return response.data

    except Exception as error:
        print("\nUnable to delete note:")
        print(error)
        return None