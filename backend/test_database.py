
import os
from getpass import getpass
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

email = input("Enter test user email: ")
password = getpass("Enter test user password: ")

try:
    # Step 1: Login
    login = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

    print("\nUser login successful!")

    # Step 2: Read papers
    response = supabase.table("papers").select("*").limit(5).execute()

    print("Database request successful!")
    print("Number of papers found:", len(response.data))

    # Step 3: Get authenticated user
    user = login.user

    # Step 4: Prepare profile information
    profile_data = {
        "id": user.id,
        "full_name": "ResearchLens Test User",
        "email": user.email
    }

    # Step 5: Insert profile
    profile_response = supabase.table("profiles").insert(
        profile_data
    ).execute()

    print("\nProfile created successfully!")
    print(profile_response.data)

except Exception as error:
    print("\nOperation failed:")
    print(error)
    