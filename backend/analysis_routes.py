
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from gemini_service import (
    GeminiAnalysisError,
    GeminiAuthenticationError,
    GeminiOutputError,
    GeminiUnavailableError,
    analyze_research_paper,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/analysis",
    tags=["AI Research Analysis"]
)


class PaperPage(BaseModel):
    page_number: int = Field(gt=0)
    text: str = Field(min_length=1)


class AnalysisRequest(BaseModel):
    paper_text: str = Field(min_length=1, max_length=2_000_000)
    pages: list[PaperPage] | None = Field(default=None, max_length=20_000)


@router.post("/")
def analyze_paper(request: AnalysisRequest):
    try:
        result = analyze_research_paper(
            request.paper_text,
            [page.model_dump() for page in request.pages] if request.pages else None,
        )

        return {
            "message": "Research paper analyzed successfully",
            "analysis": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except GeminiUnavailableError as error:
        logger.error(
            "Analysis request failed",
            extra={
                "event": "analysis_failed",
                "error_category": type(error).__name__,
                "http_status": 502,
            },
        )
        raise HTTPException(
            status_code=502,
            detail=str(error)
        ) from None

    except (GeminiAuthenticationError, GeminiOutputError) as error:
        logger.error(
            "Analysis request failed",
            extra={
                "event": "analysis_failed",
                "error_category": type(error).__name__,
                "http_status": 502,
            },
        )
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from None

    except GeminiAnalysisError:
        logger.error(
            "Analysis request failed",
            extra={
                "event": "analysis_failed",
                "error_category": "GeminiAnalysisError",
                "http_status": 502,
            },
        )
        raise HTTPException(
            status_code=502,
            detail="AI analysis failed. Please try again later."
        ) from None
