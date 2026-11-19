
import os
from getpass import getpass
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

print("===== ResearchLens Login =====")

email = input("Enter your email: ")
password = getpass("Enter your password: ")

try:
    response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

    print("\nLogin successful!")
    print("Welcome to ResearchLens!")

    user = response.user

    print("User ID:", user.id)
    print("Email:", user.email)

    profile = supabase.table("profiles") \
        .select("full_name") \
        .eq("id", user.id) \
        .execute()

    if profile.data:
        print("Name:", profile.data[0]["full_name"])

except Exception as error:
    print("\nLogin failed:")
    print(error)
