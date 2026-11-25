from paper_manager import login_user
from note_manager import add_note

print("===== RESEARCHLENS ADD NOTE =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    paper_id = input("Enter Paper ID: ")
    note_title = input("Enter Note Title: ")
    note_content = input("Enter Note Content: ")

    add_note(user_id, paper_id, note_title, note_content)