from paper_manager import login_user
from note_manager import view_notes, delete_note

print("===== RESEARCHLENS DELETE NOTE =====")

email = input("Enter your email: ")
password = input("Enter your password: ")

user = login_user(email, password)

if user:
    user_id = user.id

    paper_id = input("Enter Paper ID: ")

    notes = view_notes(user_id, paper_id)

    if notes:
        note_id = input("\nEnter Note ID to delete: ")

        delete_note(user_id, note_id)