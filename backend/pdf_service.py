import pymupdf
from fastapi import HTTPException


def extract_pdf_content(file_bytes: bytes):
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    try:
        with pymupdf.open(stream=file_bytes, filetype="pdf") as document:
            if document.is_encrypted:
                raise HTTPException(
                    status_code=400,
                    detail="Encrypted PDFs are not supported."
                )

            page_contents = []
            for page_number, page in enumerate(document, start=1):
                page_contents.append({
                    "page_number": page_number,
                    "text": page.get_text("text").strip()
                })

            metadata = document.metadata or {}
            total_pages = len(document)

        full_text = "\n".join(page["text"] for page in page_contents)
        if not full_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No extractable text found. The PDF may be scanned."
            )

        return {
            "total_pages": total_pages,
            "metadata": {
                "title": metadata.get("title"),
                "author": metadata.get("author"),
                "subject": metadata.get("subject")
            },
            "full_text": full_text,
            "pages": page_contents
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this PDF file."
        ) from None
