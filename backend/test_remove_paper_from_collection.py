from paper_manager import login_user

from collection_manager import view_collections, view_papers_in_collection, remove_paper_from_collection

print("===== RESEARCHLENS REMOVE PAPER FROM COLLECTION =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    collections = view_collections(user_id)

    if collections:
        collection_id = input("\nEnter Collection ID: ")

        papers = view_papers_in_collection(collection_id)

        if papers:
            paper_id = input("\nEnter Paper ID to remove: ")

            remove_paper_from_collection(collection_id, paper_id)