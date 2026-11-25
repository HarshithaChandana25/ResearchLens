from paper_manager import login_user
from collection_manager import create_collection

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

print("\nLogin successful!")

collection_name = input("Enter collection name: ")
description = input("Enter collection description: ")

result = create_collection(user.id, collection_name, description)

if result:
    print("\nCollection test completed successfully!")
else:
    print("\nCollection creation failed.")