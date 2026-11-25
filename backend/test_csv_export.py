
from paper_manager import login_user
from csv_export import export_papers_to_csv

print("===== RESEARCHLENS CSV EXPORT TEST =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    export_papers_to_csv()
