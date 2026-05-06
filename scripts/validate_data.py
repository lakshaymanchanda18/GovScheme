"""
validate_data.py — Data quality validation and reporting.

Checks:
  - Missing / empty fields
  - Duplicate schemes
  - Invalid URLs
  - Data consistency
  - Generates a markdown validation report
"""

import json
from pathlib import Path
from collections import Counter
from urllib.parse import urlparse
from datetime import datetime

import pandas as pd

from config import PROCESSED_DIR, LOGS_DIR, VALID_CATEGORIES, get_logger

logger = get_logger("validator")


# ─── Validation checks ────────────────────────────────────

def check_missing_fields(schemes: list[dict]) -> list[dict]:
    """Detect schemes with critical missing fields."""
    critical = ["name", "description", "category", "sourceUrl"]
    important = ["eligibilityCriteria", "benefits", "applicationProcess",
                 "requiredDocuments", "department"]
    issues = []
    for s in schemes:
        missing_critical = [f for f in critical if not s.get(f, "").strip()]
        missing_important = [f for f in important if not s.get(f, "").strip()]
        if missing_critical or missing_important:
            issues.append({
                "scheme_id": s.get("scheme_id", "UNKNOWN"),
                "name": s.get("name", "UNNAMED"),
                "missing_critical": missing_critical,
                "missing_important": missing_important,
            })
    return issues


def check_duplicates(schemes: list[dict]) -> list[dict]:
    """Find schemes with duplicate names."""
    name_counts = Counter(s.get("name", "").strip().lower() for s in schemes)
    dupes = []
    for name, count in name_counts.items():
        if count > 1 and name:
            dupes.append({"name": name, "count": count})
    return dupes


def check_empty_descriptions(schemes: list[dict]) -> list[str]:
    """Find schemes with empty or very short descriptions."""
    return [
        s.get("name", "UNNAMED")
        for s in schemes
        if len(s.get("description", "").strip()) < 20
    ]


def check_invalid_urls(schemes: list[dict]) -> list[dict]:
    """Find schemes with invalid source URLs."""
    invalid = []
    for s in schemes:
        url = s.get("sourceUrl", "")
        try:
            parsed = urlparse(url)
            if not all([parsed.scheme in ("http", "https"), parsed.netloc]):
                raise ValueError("bad url")
        except Exception:
            invalid.append({
                "scheme_id": s.get("scheme_id", ""),
                "name": s.get("name", ""),
                "url": url,
            })
    return invalid


def check_category_consistency(schemes: list[dict]) -> list[dict]:
    """Find schemes with non-standard categories."""
    issues = []
    for s in schemes:
        cat = s.get("category", "").strip()
        if cat and cat not in VALID_CATEGORIES and cat != "General":
            issues.append({
                "scheme_id": s.get("scheme_id", ""),
                "name": s.get("name", ""),
                "category": cat,
            })
    return issues


def check_embedding_text(schemes: list[dict]) -> list[str]:
    """Find schemes where embedding_text is missing or too short."""
    return [
        s.get("name", "UNNAMED")
        for s in schemes
        if len(s.get("embedding_text", "").strip()) < 50
    ]


# ─── Report generator ─────────────────────────────────────

def generate_report(schemes: list[dict]) -> str:
    """Run all checks and produce a markdown validation report."""
    logger.info("Running validation on %d schemes", len(schemes))

    missing = check_missing_fields(schemes)
    dupes = check_duplicates(schemes)
    empty_desc = check_empty_descriptions(schemes)
    bad_urls = check_invalid_urls(schemes)
    bad_cats = check_category_consistency(schemes)
    bad_embed = check_embedding_text(schemes)

    total = len(schemes)
    cat_dist = Counter(s.get("category", "Unknown") for s in schemes)

    # Score
    issues_count = len(missing) + len(dupes) + len(empty_desc) + len(bad_urls)
    quality_score = max(0, 100 - (issues_count / max(total, 1)) * 100)

    lines = [
        f"# GovScheme Dataset Validation Report",
        f"",
        f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Total Schemes**: {total}",
        f"**Quality Score**: {quality_score:.1f}/100",
        f"",
        f"---",
        f"",
        f"## Summary",
        f"",
        f"| Check | Count | Status |",
        f"|-------|-------|--------|",
        f"| Missing Fields | {len(missing)} | {'⚠️' if missing else '✅'} |",
        f"| Duplicates | {len(dupes)} | {'⚠️' if dupes else '✅'} |",
        f"| Empty Descriptions | {len(empty_desc)} | {'⚠️' if empty_desc else '✅'} |",
        f"| Invalid URLs | {len(bad_urls)} | {'⚠️' if bad_urls else '✅'} |",
        f"| Non-standard Categories | {len(bad_cats)} | {'⚠️' if bad_cats else '✅'} |",
        f"| Weak Embedding Text | {len(bad_embed)} | {'⚠️' if bad_embed else '✅'} |",
        f"",
        f"---",
        f"",
        f"## Category Distribution",
        f"",
        f"| Category | Count |",
        f"|----------|-------|",
    ]
    for cat, count in cat_dist.most_common():
        lines.append(f"| {cat} | {count} |")

    if missing:
        lines += ["", "---", "", "## Missing Fields Detail", ""]
        for item in missing[:20]:
            lines.append(
                f"- **{item['name']}**: critical={item['missing_critical']}, "
                f"important={item['missing_important']}"
            )
        if len(missing) > 20:
            lines.append(f"- ... and {len(missing) - 20} more")

    if dupes:
        lines += ["", "---", "", "## Duplicates", ""]
        for d in dupes:
            lines.append(f"- \"{d['name']}\" appears {d['count']} times")

    if empty_desc:
        lines += ["", "---", "", "## Empty/Short Descriptions", ""]
        for name in empty_desc[:15]:
            lines.append(f"- {name}")

    if bad_urls:
        lines += ["", "---", "", "## Invalid URLs", ""]
        for u in bad_urls[:15]:
            lines.append(f"- {u['name']}: `{u['url']}`")

    lines += ["", "---", "", f"*Report complete. {total} schemes validated.*"]
    return "\n".join(lines)


def main():
    logger.info("=" * 60)
    logger.info("Starting validation pipeline")
    logger.info("=" * 60)

    data_path = PROCESSED_DIR / "schemes_cleaned.json"
    if not data_path.exists():
        logger.error("Cleaned data not found at %s — run clean_data.py first", data_path)
        return

    with open(data_path, encoding="utf-8") as f:
        schemes = json.load(f)

    report = generate_report(schemes)

    # Save report
    report_path = LOGS_DIR / "validation_report.md"
    report_path.write_text(report, encoding="utf-8")
    logger.info("Validation report → %s", report_path)

    # Also save as JSON for programmatic access
    results = {
        "total_schemes": len(schemes),
        "missing_fields": check_missing_fields(schemes),
        "duplicates": check_duplicates(schemes),
        "empty_descriptions": check_empty_descriptions(schemes),
        "invalid_urls": check_invalid_urls(schemes),
    }
    results_path = LOGS_DIR / "validation_results.json"
    results_path.write_text(
        json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    try:
        print(report)
    except UnicodeEncodeError:
        print(report.encode("ascii", errors="replace").decode())
    logger.info("Validation pipeline complete")


if __name__ == "__main__":
    main()
