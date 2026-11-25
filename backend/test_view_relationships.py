from paper_manager import login_user
from relationship_manager import view_relationships

print("===== RESEARCHLENS VIEW RELATIONSHIPS =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    view_relationships()