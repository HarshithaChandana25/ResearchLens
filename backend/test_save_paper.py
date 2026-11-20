
from getpass import getpass
from paper_manager import login_user, save_paper

print("===== ResearchLens Save Paper Test =====")

email = input("Enter your email: ")
password = getpass("Enter your password: ")

try:
    user = login_user(email, password)

    print("\nLogin successful!")
    print("Welcome:", user.email)

    paper_id = "38c20bc5-e95c-4edc-b16a-f830abbc51b1"

    save_paper(user.id, paper_id)

except Exception as error:
    print("\nError:")
    print(error)
