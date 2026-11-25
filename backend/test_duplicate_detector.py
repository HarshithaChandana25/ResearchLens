from paper_manager import login_user
from duplicate_detector import check_duplicate_paper

print("===== RESEARCHLENS DUPLICATE PAPER DETECTOR =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    title = input("\nEnter Research Paper Title: ")
    doi = input("Enter DOI (press Enter if unavailable): ")

    check_duplicate_paper(title, doi)