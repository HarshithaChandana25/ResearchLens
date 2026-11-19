
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Get Supabase credentials
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Check credentials
if not url or not key:
    print("Supabase credentials are missing!")
else:
    supabase = create_client(url, key)
    print("Supabase client created successfully!")
    print("Project URL:", url)
