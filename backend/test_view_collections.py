from paper_manager import login_user
from collection_manager import view_collections

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

print("\nLogin successful!")

collections = view_collections(user.id)

if collections is not None:
    print("\nCollection viewing test completed successfully!")
else:
    print("\nCollection viewing test failed.")