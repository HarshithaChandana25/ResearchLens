from paper_manager import login_user
from comparison_manager import save_comparison

print("===== RESEARCHLENS PAPER COMPARISON =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    paper1_id = input("Enter First Paper ID: ")
    paper2_id = input("Enter Second Paper ID: ")

    comparison_result = {
        "objectives": "Both papers focus on machine learning research.",
        "methodology": "Paper 1 uses experimental analysis; Paper 2 uses comparative analysis.",
        "algorithms": "Random Forest, SVM and CNN",
        "datasets": "Research Paper Dataset and IEEE Dataset",
        "evaluation_metrics": "Accuracy, Precision and Recall"
    }

    similarities = input("Enter Similarities: ")
    differences = input("Enter Differences: ")
    missing_information = input("Enter Missing Information: ")

    save_comparison(
        user_id,
        paper1_id,
        paper2_id,
        comparison_result,
        similarities,
        differences,
        missing_information
    )