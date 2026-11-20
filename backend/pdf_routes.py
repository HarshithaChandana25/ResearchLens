
from fastapi import APIRouter, UploadFile, File, HTTPException
from pdf_service import extract_pdf_content

router = APIRouter(prefix="/api/pdf", tags=["PDF Processing"])
MAX_PDF_BYTES = 15 * 1024 * 1024


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    file_bytes = await file.read(MAX_PDF_BYTES + 1)

    if len(file_bytes) > MAX_PDF_BYTES:
        raise HTTPException(
            status_code=413,
            detail="PDF size must be 15 MB or less."
        )

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )

    result = extract_pdf_content(file_bytes)

    return {
        "message": "PDF uploaded and processed successfully.",
        "filename": file.filename,
        **result
    }
