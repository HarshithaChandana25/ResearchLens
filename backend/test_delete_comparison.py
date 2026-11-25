from paper_manager import login_user
from comparison_manager import view_comparisons, delete_comparison

print("===== RESEARCHLENS DELETE COMPARISON =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    comparisons = view_comparisons(user_id)

    if comparisons:
        comparison_id = input("\nEnter Comparison ID to delete: ")

        confirm = input(
            "Are you sure you want to delete this comparison? (yes/no): "
        )

        if confirm.lower() == "yes":
            delete_comparison(user_id, comparison_id)
        else:
            print("\nDeletion cancelled.")