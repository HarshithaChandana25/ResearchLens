
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pdf_routes import router as pdf_router
from analysis_routes import router as analysis_router

# Create the FastAPI application FIRST
app = FastAPI(
    title="ResearchLens API",
    description="AI-powered Research Paper Analysis Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers AFTER creating app
app.include_router(pdf_router)
app.include_router(analysis_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to ResearchLens!",
        "status": "Backend is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "project": "ResearchLens"
    }
