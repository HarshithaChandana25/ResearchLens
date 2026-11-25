from paper_manager import login_user
from comparison_manager import view_comparisons

print("===== RESEARCHLENS VIEW COMPARISONS =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    view_comparisons(user_id)