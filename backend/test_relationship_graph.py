from paper_manager import login_user
from relationship_graph import get_relationship_graph

print("===== RESEARCHLENS RELATIONSHIP GRAPH TEST =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    get_relationship_graph()