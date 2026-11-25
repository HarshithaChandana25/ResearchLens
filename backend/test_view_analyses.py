from paper_manager import login_user
from analysis_manager import view_analyses

print("===== RESEARCHLENS VIEW AI ANALYSES =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    paper_id = input("Enter Paper ID: ")

    view_analyses(user_id, paper_id)