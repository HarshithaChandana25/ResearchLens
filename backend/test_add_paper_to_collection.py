from paper_manager import login_user, view_saved_papers
from collection_manager import view_collections, add_paper_to_collection

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

print("\nLogin successful!")

collections = view_collections(user.id)

if not collections:
    print("\nCreate a collection first.")
    exit()

saved_papers = view_saved_papers(user.id)

if not saved_papers:
    print("\nSave a paper first.")
    exit()

collection_id = input("\nEnter the Collection ID: ")
paper_id = input("\nEnter the Paper ID: ")

result = add_paper_to_collection(collection_id, paper_id)

if result:
    print("\nAdd paper to collection test completed successfully!")
else:
    print("\nAdd paper to collection test failed.")