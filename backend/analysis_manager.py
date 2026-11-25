from paper_manager import supabase
def save_analysis(
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
):
    try:
        data = {
            "user_id": user_id,
            "paper_id": paper_id,
            "objectives": objectives,
            "methodology": methodology,
            "algorithms": algorithms,
            "datasets": datasets,
            "experimental_setup": experimental_setup,
            "evaluation_metrics": evaluation_metrics,
            "results": results,
            "limitations": limitations,
            "future_work": future_work
        }

        response = supabase.table("analyses").insert(data).execute()

        print("\nAI analysis saved successfully!")

        return response.data

    except Exception as error:
        print("\nUnable to save AI analysis:")
        print(error)
        return None

def view_analyses(user_id, paper_id):
    try:
        response = (
            supabase.table("analyses")
            .select("*")
            .eq("user_id", user_id)
            .eq("paper_id", paper_id)
            .order("created_at", desc=True)
            .execute()
        )

        print("\n===== SAVED AI ANALYSES =====")

        if not response.data:
            print("No analyses found for this paper.")
            return []

        for analysis in response.data:
            print("\nAnalysis ID:", analysis["id"])
            print("Objectives:", analysis["objectives"])
            print("Methodology:", analysis["methodology"])
            print("Algorithms:", analysis["algorithms"])
            print("Datasets:", analysis["datasets"])
            print("Experimental Setup:", analysis["experimental_setup"])
            print("Evaluation Metrics:", analysis["evaluation_metrics"])
            print("Results:", analysis["results"])
            print("Limitations:", analysis["limitations"])
            print("Future Work:", analysis["future_work"])
            print("Created At:", analysis["created_at"])
            print("--------------------------------")

        return response.data

    except Exception as error:
        print("\nUnable to retrieve AI analyses:")
        print(error)
        return None

def update_analysis(
    user_id,
    analysis_id,
    objectives,
    methodology,
    algorithms,
    datasets,
    experimental_setup,
    evaluation_metrics,
    results,
    limitations,
    future_work
):
    try:
        data = {
            "objectives": objectives,
            "methodology": methodology,
            "algorithms": algorithms,
            "datasets": datasets,
            "experimental_setup": experimental_setup,
            "evaluation_metrics": evaluation_metrics,
            "results": results,
            "limitations": limitations,
            "future_work": future_work
        }

        response = (
            supabase.table("analyses")
            .update(data)
            .eq("id", analysis_id)
            .eq("user_id", user_id)
            .execute()
        )

        if response.data:
            print("\nAI analysis updated successfully!")
        else:
            print("\nNo matching analysis found.")

        return response.data

    except Exception as error:
        print("\nUnable to update AI analysis:")
        print(error)
        return None

def delete_analysis(user_id, analysis_id):
    try:
        response = (
            supabase.table("analyses")
            .delete()
            .eq("user_id", user_id)
            .eq("id", analysis_id)
            .execute()
        )

        if response.data:
            print("\nAI analysis deleted successfully!")
        else:
            print("\nNo matching analysis found.")

        return response.data

    except Exception as error:
        print("\nUnable to delete AI analysis:")
        print(error)
        return None