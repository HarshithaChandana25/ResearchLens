
from getpass import getpass
from paper_manager import login_user, view_saved_papers

print("===== ResearchLens View Saved Papers =====")

email = input("Enter your email: ")
password = getpass("Enter your password: ")

try:
    user = login_user(email, password)

    print("\nLogin successful!")
    print("Welcome:", user.email)

    view_saved_papers(user.id)

except Exception as error:
    print("\nError:")
    print(error)
