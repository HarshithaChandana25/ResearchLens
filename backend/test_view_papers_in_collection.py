from paper_manager import login_user
from collection_manager import view_collections, view_papers_in_collection

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

print("\nLogin successful!")

collections = view_collections(user.id)

if not collections:
    print("\nNo collections available.")
    exit()

collection_id = input("\nEnter the Collection ID you want to open: ")

result = view_papers_in_collection(collection_id)

if result is not None:
    print("\nView papers in collection test completed successfully!")
else:
    print("\nView papers in collection test failed.")