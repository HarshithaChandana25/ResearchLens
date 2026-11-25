from paper_manager import login_user
from analysis_manager import view_analyses, delete_analysis

print("===== RESEARCHLENS DELETE AI ANALYSIS =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    paper_id = input("Enter Paper ID: ")

    analyses = view_analyses(user_id, paper_id)

    if analyses:
        analysis_id = input("\nEnter Analysis ID to delete: ")

        confirm = input("Are you sure you want to delete this analysis? (yes/no): ")

        if confirm.lower() == "yes":
            delete_analysis(user_id, analysis_id)
        else:
            print("\nDeletion cancelled.")