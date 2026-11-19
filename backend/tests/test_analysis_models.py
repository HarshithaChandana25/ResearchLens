import unittest

from analysis_models import CHECKLIST_ITEMS, normalize_analysis


class NormalizeAnalysisTests(unittest.TestCase):
    def test_completeness_uses_only_reported_and_not_found_items(self):
        source_text = "The code is available at example.org/code."
        checklist = [
            {
                "item": CHECKLIST_ITEMS[0],
                "status": "Reported",
                "evidence": "The code is available at example.org/code.",
                "page_number": 1,
            },
            {
                "item": CHECKLIST_ITEMS[1],
                "status": "Not Found",
                "evidence": None,
                "page_number": None,
            },
        ]

        result = normalize_analysis(
            {"reproducibility_checklist": checklist},
            source_text,
            [{"page_number": 1, "text": source_text}],
        )

        completeness = result["reporting_completeness"]
        self.assertEqual(completeness["percentage"], 50)
        self.assertEqual(completeness["assessable_items"], 2)
        self.assertEqual(len(completeness["reported"]), 1)
        self.assertEqual(len(completeness["not_found"]), 1)
        self.assertEqual(len(completeness["unable_to_assess"]), 8)
        self.assertEqual(result["reproducibility_checklist"][0]["page_number"], 1)

    def test_unverifiable_evidence_is_not_reported(self):
        result = normalize_analysis(
            {
                "reproducibility_checklist": [{
                    "item": CHECKLIST_ITEMS[0],
                    "status": "Reported",
                    "evidence": "This quote is absent.",
                    "page_number": 1,
                }]
            },
            "The paper text has no such claim.",
            [{"page_number": 1, "text": "The paper text has no such claim."}],
        )

        item = result["reproducibility_checklist"][0]
        self.assertEqual(item["status"], "Unable to Assess")
        self.assertIsNone(item["evidence"])
        self.assertIsNone(item["page_number"])

    def test_page_numbers_are_omitted_when_page_text_is_unavailable(self):
        result = normalize_analysis(
            {
                "reproducibility_checklist": [{
                    "item": CHECKLIST_ITEMS[0],
                    "status": "Reported",
                    "evidence": "The code is available.",
                    "page_number": 7,
                }]
            },
            "The code is available.",
        )

        self.assertIsNone(result["reproducibility_checklist"][0]["page_number"])

    def test_no_assessable_items_has_no_percentage(self):
        result = normalize_analysis({}, "Some paper text.")

        self.assertIsNone(result["reporting_completeness"]["percentage"])
        self.assertEqual(
            result["reporting_completeness"]["assessable_items"],
            0,
        )

    def test_invalid_status_is_classified_as_unable_to_assess(self):
        result = normalize_analysis(
            {
                "reproducibility_checklist": [{
                    "item": CHECKLIST_ITEMS[0],
                    "status": ["Reported"],
                    "evidence": None,
                    "page_number": None,
                }]
            },
            "Some paper text.",
        )

        self.assertEqual(
            result["reproducibility_checklist"][0]["status"],
            "Unable to Assess",
        )


if __name__ == "__main__":
    unittest.main()
