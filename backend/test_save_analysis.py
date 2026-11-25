from paper_manager import login_user
from analysis_manager import save_analysis

print("===== RESEARCHLENS SAVE AI ANALYSIS =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    paper_id = input("Enter Paper ID: ")

    objectives = input("Enter Objectives: ")
    methodology = input("Enter Methodology: ")

    algorithms = input("Enter Algorithms (comma separated): ").split(",")
    datasets = input("Enter Datasets (comma separated): ").split(",")

    experimental_setup = input("Enter Experimental Setup: ")

    evaluation_metrics = input(
        "Enter Evaluation Metrics (comma separated): "
    ).split(",")

    results = input("Enter Results: ")
    limitations = input("Enter Limitations: ")
    future_work = input("Enter Future Work: ")

    save_analysis(
        user_id,
        paper_id,
        objectives,
        methodology,
        algorithms,
        datasets,
        experimental_setup,
        evaluation_metrics,
        results,
        limitations,
        future_work
    )