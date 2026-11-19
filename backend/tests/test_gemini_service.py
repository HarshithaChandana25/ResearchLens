import json
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from analysis_models import CHECKLIST_ITEMS
from gemini_service import (
    CHUNK_SIZE_CHARS,
    GeminiAnalysisError,
    GeminiAuthenticationError,
    GeminiJSONError,
    GeminiOutputError,
    GeminiUnavailableError,
    MAX_PROVIDER_ATTEMPTS,
    analyze_research_paper,
    _generate_content_with_retry,
    _generate_json,
    _make_chunks,
)
from google.genai import errors


class GeminiServiceTests(unittest.TestCase):
    @staticmethod
    def _model_result():
        return {
            "research_title": "A test paper",
            "authors": ["A. Researcher"],
            "abstract": "A short abstract.",
            "research_problem": "A research problem.",
            "research_objectives": "An objective.",
            "methodology": "A method.",
            "algorithms_models": "A model.",
            "dataset": "A dataset.",
            "experimental_setup": "An experiment.",
            "evaluation_metrics": "Accuracy.",
            "results_findings": "A result.",
            "limitations": "A limitation.",
            "future_scope": "A future direction.",
            "paper_summary": "A concise summary.",
            "reproducibility_checklist": [
                {
                    "item": item,
                    "status": "Not Found",
                    "evidence": None,
                    "page_number": None,
                }
                for item in CHECKLIST_ITEMS
            ],
        }

    def test_analysis_is_normalized_without_calling_external_gemini(self):
        source_text = "Code is available at example.org/code."
        model_result = {
            "research_title": "A test paper",
            "authors": ["A. Researcher"],
            "abstract": "A short abstract.",
            "research_problem": "A research problem.",
            "research_objectives": "An objective.",
            "methodology": "A method.",
            "algorithms_models": "A model.",
            "dataset": "A dataset.",
            "experimental_setup": "An experiment.",
            "evaluation_metrics": "Accuracy.",
            "results_findings": "A result.",
            "limitations": "A limitation.",
            "future_scope": "A future direction.",
            "paper_summary": "A concise summary.",
            "reproducibility_checklist": [
                {
                    "item": CHECKLIST_ITEMS[0],
                    "status": "Reported",
                    "evidence": "Code is available at example.org/code.",
                    "page_number": 1,
                }
            ],
        }
        fake_client = SimpleNamespace(
            models=SimpleNamespace(
                generate_content=lambda **kwargs: SimpleNamespace(
                    text=json.dumps(model_result)
                )
            )
        )

        with patch("gemini_service._get_client", return_value=fake_client):
            result = analyze_research_paper(
                source_text,
                [{"page_number": 1, "text": source_text}],
            )

        self.assertEqual(result["research_title"], "A test paper")
        self.assertEqual(result["authors"], ["A. Researcher"])
        self.assertEqual(
            result["reproducibility_checklist"][0]["page_number"],
            1,
        )
        self.assertEqual(result["reporting_completeness"]["assessable_items"], 1)
        self.assertEqual(result["reporting_completeness"]["percentage"], 100)

    def test_invalid_model_json_becomes_a_safe_service_error(self):
        fake_client = SimpleNamespace(
            models=SimpleNamespace(
                generate_content=lambda **kwargs: SimpleNamespace(text="not-json")
            )
        )

        with patch("gemini_service._get_client", return_value=fake_client):
            with self.assertRaisesRegex(GeminiAnalysisError, "invalid JSON"):
                analyze_research_paper("Some paper text.")

    def test_empty_paper_is_rejected_before_provider_call(self):
        with self.assertRaisesRegex(ValueError, "No research paper text"):
            analyze_research_paper(" \n ")

    def test_large_paper_is_chunked_and_fully_accounted_for(self):
        source_text = ("Research detail. " * 7_100)[:120_500]
        prompts = []

        def fake_generate_json(client, prompt, **kwargs):
            prompts.append(prompt)
            return self._model_result()

        with (
            patch("gemini_service._get_client", return_value=object()),
            patch("gemini_service._generate_json", side_effect=fake_generate_json),
        ):
            result = analyze_research_paper(source_text)

        coverage = result["processing_coverage"]
        self.assertGreater(len(source_text), 100_000)
        self.assertEqual(coverage["status"], "complete")
        self.assertEqual(coverage["total_characters"], len(source_text))
        self.assertEqual(coverage["processed_characters"], len(source_text))
        self.assertEqual(coverage["unprocessed_characters"], 0)
        self.assertGreater(coverage["processed_chunks"], 1)
        self.assertEqual(len(prompts), coverage["total_chunks"] + 1)

    def test_chunking_preserves_the_exact_source_text(self):
        source_text = ("A section with details.\n" * 2_500) + "End of paper."
        chunks = _make_chunks(source_text, [])

        self.assertEqual("".join(chunk["text"] for chunk in chunks), source_text)
        self.assertTrue(all(
            len(chunk["text"]) <= CHUNK_SIZE_CHARS
            for chunk in chunks
        ))

    def test_reported_checklist_evidence_is_carried_from_its_source_chunk(self):
        source_text = (
            "The source code is available at https://example.test/code.\n"
            + ("Additional paper content. " * 1_200)
        )
        first_result = self._model_result()
        first_result["reproducibility_checklist"][2] = {
            "item": CHECKLIST_ITEMS[2],
            "status": "Reported",
            "evidence": "The source code is available at https://example.test/code.",
            "page_number": 1,
        }
        with (
            patch("gemini_service._get_client", return_value=object()),
            patch(
                "gemini_service._generate_json",
                side_effect=[first_result, self._model_result(), self._model_result()],
            ),
        ):
            result = analyze_research_paper(
                source_text,
                [{"page_number": 1, "text": source_text}],
            )

        item = next(
            value for value in result["reproducibility_checklist"]
            if value["item"] == CHECKLIST_ITEMS[2]
        )
        self.assertEqual(item["status"], "Reported")
        self.assertEqual(
            item["evidence"],
            "The source code is available at https://example.test/code.",
        )
        self.assertEqual(item["page_number"], 1)

    def test_chunk_cap_reports_unprocessed_content_and_marks_absence_unknown(self):
        source_text = "Research detail. " * (CHUNK_SIZE_CHARS // 10 + 3_000)
        with (
            patch("gemini_service.MAX_ANALYSIS_CHUNKS", 1),
            patch("gemini_service._get_client", return_value=object()),
            patch(
                "gemini_service._generate_json",
                side_effect=[self._model_result(), self._model_result()],
            ),
        ):
            result = analyze_research_paper(source_text)

        coverage = result["processing_coverage"]
        self.assertEqual(coverage["status"], "partial")
        self.assertEqual(coverage["processed_chunks"], 1)
        self.assertGreater(coverage["unprocessed_characters"], 0)
        self.assertEqual(
            coverage["unprocessed_ranges"][0]["end_char_exclusive"],
            len(source_text),
        )
        self.assertTrue(all(
            item["status"] == "Unable to Assess"
            for item in result["reproducibility_checklist"]
        ))

    def test_transient_503_retries_with_bounded_exponential_backoff(self):
        results = iter([
            errors.ServerError(503, {"error": {"message": "unavailable"}}),
            "success",
        ])
        calls = []
        delays = []

        def generate():
            calls.append(True)
            result = next(results)
            if isinstance(result, Exception):
                raise result
            return result

        response = _generate_content_with_retry(generate, delays.append)

        self.assertEqual(response, "success")
        self.assertEqual(len(calls), 2)
        self.assertEqual(delays, [1.0])

    def test_persistent_503_stops_after_maximum_attempts(self):
        calls = []
        delays = []

        def generate():
            calls.append(True)
            raise errors.ServerError(503, {"error": {"message": "unavailable"}})

        with self.assertRaisesRegex(
            GeminiUnavailableError,
            "temporarily unavailable",
        ):
            _generate_content_with_retry(generate, delays.append)

        self.assertEqual(len(calls), MAX_PROVIDER_ATTEMPTS)
        self.assertEqual(delays, [1.0, 2.0])

    def test_timeout_is_retried_with_bounded_backoff(self):
        calls = []
        delays = []

        def generate():
            calls.append(True)
            if len(calls) == 1:
                raise TimeoutError("provider timed out")
            return "success"

        response = _generate_content_with_retry(generate, delays.append)

        self.assertEqual(response, "success")
        self.assertEqual(len(calls), 2)
        self.assertEqual(delays, [1.0])

    def test_rate_limit_has_distinct_safe_error(self):
        def generate():
            raise errors.ClientError(429, {"error": {"message": "private detail"}})

        with self.assertRaisesRegex(GeminiUnavailableError, "rate limit or quota"):
            _generate_content_with_retry(generate, lambda _: None)

    def test_authentication_and_access_errors_are_not_retried(self):
        for status, expected in (
            (401, "authentication failed"),
            (403, "denied access"),
        ):
            calls = []

            def generate():
                calls.append(True)
                raise errors.ClientError(status, {"error": {"message": "secret"}})

            with self.subTest(status=status):
                with self.assertRaises(GeminiAuthenticationError) as context:
                    _generate_content_with_retry(generate)
                self.assertIn(expected, str(context.exception))
                self.assertNotIn("secret", str(context.exception))
                self.assertEqual(len(calls), 1)

    def test_json_parse_and_invalid_output_errors_are_distinct(self):
        responses = [
            SimpleNamespace(text="not-json"),
            SimpleNamespace(text="[]"),
        ]

        for response, error_type, message in (
            (responses[0], GeminiJSONError, "malformed JSON"),
            (responses[1], GeminiOutputError, "unsupported format"),
        ):
            with self.subTest(error_type=error_type.__name__):
                with patch(
                    "gemini_service._generate_content_with_retry",
                    return_value=response,
                ):
                    with self.assertRaisesRegex(error_type, message):
                        _generate_json(object(), "safe prompt")

    def test_non_503_provider_errors_are_not_retried(self):
        calls = []
        delays = []

        def generate():
            calls.append(True)
            raise errors.APIError(400, {"error": {"message": "bad request"}})

        with self.assertRaises(GeminiAnalysisError):
            _generate_content_with_retry(generate, delays.append)

        self.assertEqual(len(calls), 1)
        self.assertEqual(delays, [])

    def test_missing_configured_model_returns_safe_unavailability_error(self):
        calls = []

        def generate():
            calls.append(True)
            raise errors.ClientError(
                404,
                {
                    "error": {
                        "message": "private provider model detail",
                        "status": "NOT_FOUND",
                    }
                },
            )

        with self.assertRaisesRegex(
            GeminiUnavailableError,
            "configured Gemini model is unavailable",
        ) as context:
            _generate_content_with_retry(generate)

        self.assertEqual(len(calls), 1)
        self.assertNotIn("private provider model detail", str(context.exception))

    def test_generate_json_falls_back_to_available_model(self):
        fallback_result = self._model_result()
        calls = []

        def fake_generate_with_retry(generate, **kwargs):
            calls.append(True)
            if len(calls) == 1:
                raise GeminiUnavailableError("configured model unavailable")
            return SimpleNamespace(text=json.dumps(fallback_result))

        with patch(
            "gemini_service._generate_content_with_retry",
            side_effect=fake_generate_with_retry,
        ):
            result = _generate_json(object(), "Analyze the paper.")

        self.assertEqual(result["research_title"], "A test paper")


if __name__ == "__main__":
    unittest.main()
