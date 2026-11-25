from paper_manager import supabase


def save_comparison(
    user_id,
    paper1_id,
    paper2_id,
    comparison_result,
    similarities,
    differences,
    missing_information
):
    try:
        data = {
            "user_id": user_id,
            "paper1_id": paper1_id,
            "paper2_id": paper2_id,
            "comparison_result": comparison_result,
            "similarities": similarities,
            "differences": differences,
            "missing_information": missing_information
        }

        response = supabase.table("comparisons").insert(data).execute()

        print("\nPaper comparison saved successfully!")
        return response.data

    except Exception as error:
        print("\nUnable to save paper comparison:")
        print(error)
        return None

def view_comparisons(user_id):
    try:
        response = (
            supabase.table("comparisons")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        print("\n===== SAVED PAPER COMPARISONS =====")

        if not response.data:
            print("No comparisons found.")
            return []

        for comparison in response.data:
            print("\nComparison ID:", comparison["id"])
            print("Paper 1 ID:", comparison["paper1_id"])
            print("Paper 2 ID:", comparison["paper2_id"])
            print("Comparison Result:", comparison["comparison_result"])
            print("Similarities:", comparison["similarities"])
            print("Differences:", comparison["differences"])
            print("Missing Information:", comparison["missing_information"])
            print("Created At:", comparison["created_at"])
            print("--------------------------------")

        return response.data

    except Exception as error:
        print("\nUnable to view comparisons:")
        print(error)
        return None

def delete_comparison(user_id, comparison_id):
    try:
        response = (
            supabase.table("comparisons")
            .delete()
            .eq("user_id", user_id)
            .eq("id", comparison_id)
            .execute()
        )

        if response.data:
            print("\nPaper comparison deleted successfully!")
        else:
            print("\nNo matching comparison found.")

        return response.data

    except Exception as error:
        print("\nUnable to delete comparison:")
        print(error)
        return None