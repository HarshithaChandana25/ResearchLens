from paper_manager import login_user, view_saved_papers, delete_saved_paper

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

print("\nLogin successful!")

saved = view_saved_papers(user.id)

if saved:
    paper_id = input("\nEnter the Paper ID you want to delete: ")

    result = delete_saved_paper(user.id, paper_id)

    if result:
        print("\nDelete operation completed.")
    else:
        print("\nDelete operation was not successful.")
else:
    print("\nYou have no saved papers to delete.")