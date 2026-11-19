import unittest
from unittest.mock import patch

import pymupdf
from fastapi.testclient import TestClient

from gemini_service import (
    GeminiAnalysisError,
    GeminiAuthenticationError,
    GeminiJSONError,
    GeminiUnavailableError,
)
from main import app


class ApiRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_existing_health_and_root_routes_remain_available(self):
        self.assertEqual(self.client.get("/").status_code, 200)
        health = self.client.get("/api/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json()["status"], "healthy")

    def test_pdf_upload_returns_text_and_page_numbers(self):
        document = pymupdf.open()
        page = document.new_page()
        page.insert_text((72, 72), "Research paper text")
        document.set_metadata({
            "title": "Test metadata title",
            "author": "Test author",
            "subject": "Test subject",
        })
        pdf_bytes = document.tobytes()
        document.close()

        response = self.client.post(
            "/api/pdf/upload",
            files={"file": ("paper.pdf", pdf_bytes, "application/pdf")},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["full_text"], "Research paper text")
        self.assertEqual(response.json()["pages"][0]["page_number"], 1)
        self.assertEqual(
            response.json()["metadata"]["title"],
            "Test metadata title",
        )

    def test_pdf_rejects_non_pdf_extension(self):
        response = self.client.post(
            "/api/pdf/upload",
            files={"file": ("paper.txt", b"not a pdf", "text/plain")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Only PDF files are allowed.")

    def test_analysis_rejects_blank_paper_text(self):
        response = self.client.post(
            "/api/analysis/",
            json={"paper_text": "   "},
        )

        self.assertEqual(response.status_code, 400)

    def test_analysis_route_keeps_success_envelope_and_accepts_optional_pages(self):
        expected = {"research_title": "A test paper"}
        with patch("analysis_routes.analyze_research_paper", return_value=expected):
            response = self.client.post(
                "/api/analysis/",
                json={
                    "paper_text": "A test paper",
                    "pages": [{"page_number": 1, "text": "A test paper"}],
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["analysis"], expected)

    def test_analysis_provider_errors_do_not_reach_api_response(self):
        with patch(
            "analysis_routes.analyze_research_paper",
            side_effect=GeminiAnalysisError("provider detail must stay private"),
        ):
            response = self.client.post(
                "/api/analysis/",
                json={"paper_text": "A test paper"},
            )

        self.assertEqual(response.status_code, 502)
        self.assertEqual(
            response.json()["detail"],
            "AI analysis failed. Please try again later.",
        )
        self.assertNotIn("provider detail", response.text)

    def test_analysis_route_reports_sanitized_provider_unavailability(self):
        error = GeminiUnavailableError(
            "Gemini is temporarily unavailable after 3 attempts. "
            "Please try again later."
        )
        with patch(
            "analysis_routes.analyze_research_paper",
            side_effect=error,
        ):
            response = self.client.post(
                "/api/analysis/",
                json={"paper_text": "A test paper"},
            )

        self.assertEqual(response.status_code, 502)
        self.assertEqual(
            response.json()["detail"],
            "Gemini is temporarily unavailable after 3 attempts. "
            "Please try again later.",
        )

    def test_analysis_route_returns_safe_authentication_diagnostic(self):
        with patch(
            "analysis_routes.analyze_research_paper",
            side_effect=GeminiAuthenticationError(
                "Gemini authentication failed (HTTP 401). Verify API-key validity and access."
            ),
        ):
            response = self.client.post(
                "/api/analysis/",
                json={"paper_text": "A test paper"},
            )

        self.assertEqual(response.status_code, 502)
        self.assertIn("authentication failed (HTTP 401)", response.json()["detail"])

    def test_analysis_route_returns_safe_json_diagnostic(self):
        with patch(
            "analysis_routes.analyze_research_paper",
            side_effect=GeminiJSONError(
                "Gemini returned malformed JSON. Please retry the analysis."
            ),
        ):
            response = self.client.post(
                "/api/analysis/",
                json={"paper_text": "A test paper"},
            )

        self.assertEqual(response.status_code, 502)
        self.assertIn("malformed JSON", response.json()["detail"])

    def test_empty_pdf_is_rejected(self):
        response = self.client.post(
            "/api/pdf/upload",
            files={"file": ("paper.pdf", b"", "application/pdf")},
        )

        self.assertEqual(response.status_code, 400)

    def test_unreadable_pdf_is_rejected(self):
        response = self.client.post(
            "/api/pdf/upload",
            files={
                "file": (
                    "paper.pdf",
                    b"%PDF-1.7\nnot a valid PDF document",
                    "application/pdf",
                )
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Unable to read this PDF file.")

    def test_pdf_without_extractable_text_is_rejected(self):
        document = pymupdf.open()
        document.new_page()
        pdf_bytes = document.tobytes()
        document.close()

        response = self.client.post(
            "/api/pdf/upload",
            files={"file": ("paper.pdf", pdf_bytes, "application/pdf")},
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
