from paper_manager import login_user
from relationship_manager import add_relationship

print("===== RESEARCHLENS ADD PAPER RELATIONSHIP =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    source_paper_id = input("Enter Source Paper ID: ")
    target_paper_id = input("Enter Target Paper ID: ")

    relationship_type = input(
        "Enter Relationship Type (Cites/Extends/Improves): "
    )

    description = input("Enter Relationship Description: ")

    add_relationship(
        source_paper_id,
        target_paper_id,
        relationship_type,
        description
    )