import re
from typing import Any


CHECKLIST_ITEMS = (
    "Dataset availability",
    "Dataset description",
    "Source code availability",
    "Algorithm details",
    "Hyperparameters",
    "Experimental setup",
    "Hardware/software details",
    "Evaluation metrics",
    "Random seed or reproducibility settings",
    "Statistical significance or repeated experiments",
)

CHECKLIST_STATUSES = {"Reported", "Not Found", "Unable to Assess"}
UNKNOWN = "Unable to Assess"


def _normalize_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", value).strip()


def _contains_evidence(source: str, evidence: str) -> bool:
    return bool(evidence) and evidence.casefold() in _normalize_text(source).casefold()


def normalize_analysis(
    result: Any,
    source_text: str,
    pages: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    if not isinstance(result, dict):
        raise ValueError("Gemini response must be a JSON object.")

    fields = (
        "research_title",
        "authors",
        "abstract",
        "research_problem",
        "research_objectives",
        "methodology",
        "algorithms_models",
        "dataset",
        "experimental_setup",
        "evaluation_metrics",
        "results_findings",
        "limitations",
        "future_scope",
        "paper_summary",
    )
    normalized = {
        field: result.get(field, UNKNOWN)
        for field in fields
    }

    authors = normalized["authors"]
    if isinstance(authors, str):
        normalized["authors"] = [authors] if authors.strip() else []
    elif not isinstance(authors, list) or not all(isinstance(author, str) for author in authors):
        normalized["authors"] = []

    for field in fields:
        if field == "authors":
            normalized[field] = [
                author.strip() for author in normalized[field] if author.strip()
            ]
        elif not isinstance(normalized[field], str) or not normalized[field].strip():
            normalized[field] = UNKNOWN

    raw_checklist = result.get("reproducibility_checklist")
    checklist_by_name = {}
    if isinstance(raw_checklist, list):
        checklist_by_name = {
            entry.get("item"): entry
            for entry in raw_checklist
            if isinstance(entry, dict) and isinstance(entry.get("item"), str)
        }

    page_text = {
        page["page_number"]: page["text"]
        for page in (pages or [])
        if isinstance(page, dict)
        and isinstance(page.get("page_number"), int)
        and isinstance(page.get("text"), str)
    }
    checklist = []
    for item in CHECKLIST_ITEMS:
        entry = checklist_by_name.get(item, {})
        status = entry.get("status")
        evidence = _normalize_text(entry.get("evidence"))
        if not isinstance(status, str) or status not in CHECKLIST_STATUSES:
            status = UNKNOWN
        if status == "Reported" and not _contains_evidence(source_text, evidence):
            status = UNKNOWN
            evidence = ""
        if status != "Reported":
            evidence = ""

        page_number = entry.get("page_number")
        if (
            status != "Reported"
            or type(page_number) is not int
            or page_number not in page_text
            or not _contains_evidence(page_text[page_number], evidence)
        ):
            page_number = None
        checklist.append({
            "item": item,
            "status": status,
            "evidence": evidence or None,
            "page_number": page_number,
        })

    reported = [entry for entry in checklist if entry["status"] == "Reported"]
    not_found = [entry for entry in checklist if entry["status"] == "Not Found"]
    unable = [entry for entry in checklist if entry["status"] == UNKNOWN]
    assessable_count = len(reported) + len(not_found)
    completeness = (
        round(len(reported) * 100 / assessable_count, 1)
        if assessable_count
        else None
    )

    normalized["reproducibility_checklist"] = checklist
    normalized["reporting_completeness"] = {
        "percentage": completeness,
        "assessable_items": assessable_count,
        "reported": reported,
        "not_found": not_found,
        "unable_to_assess": unable,
        "note": (
            "This measures reporting completeness in the supplied paper text; "
            "it does not establish whether the results are reproducible."
        ),
    }
    return normalized
