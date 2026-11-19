
import os
from getpass import getpass
from dotenv import load_dotenv
from supabase import create_client

# Load Supabase credentials
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

print("===== ResearchLens Registration =====")

full_name = input("Enter your full name: ")
email = input("Enter your email: ")
password = getpass("Create your password: ")

try:
    # Register new user
    response = supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": {
                "full_name": full_name
            }
        }
    })

    if response.user:
        print("\nRegistration successful!")
        print("User ID:", response.user.id)
        print("Email:", response.user.email)
        print("Your profile will be created automatically.")

        if response.session is None:
            print("Please check your email if confirmation is required.")

except Exception as error:
    print("\nRegistration failed:")
    print(error)
