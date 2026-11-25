from paper_manager import login_user
from research_trends import get_research_trends

print("===== RESEARCHLENS RESEARCH TRENDS TEST =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    get_research_trends()