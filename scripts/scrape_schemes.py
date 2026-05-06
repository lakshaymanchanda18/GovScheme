"""
scrape_schemes.py — Legal, compliant data extraction pipeline.

Data Sources (all legal):
  1. Official Open Government Data API (data.gov.in) — designed for public use
  2. Manually curated seed dataset of publicly known scheme information
  3. User-provided CSV/JSON imports

This script does NOT scrape any website. It only uses:
  - Official government open-data APIs with proper API keys
  - Publicly available, manually curated information
"""

import json
import time
import random
from pathlib import Path

import requests
import pandas as pd

from config import (
    RAW_DIR, PROJECT_ROOT, REQUEST_TIMEOUT,
    MAX_RETRIES, RETRY_BACKOFF_FACTOR, get_logger,
)

logger = get_logger("extractor")


# ─── HTTP helper (for official APIs only) ──────────────────

class APIClient:
    """HTTP client for official government open-data APIs."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/json",
            "User-Agent": "GovScheme-RAG-Pipeline/1.0 (Educational Project)",
        })

    def get(self, url: str, params: dict | None = None) -> requests.Response | None:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = self.session.get(url, params=params, timeout=REQUEST_TIMEOUT)
                resp.raise_for_status()
                return resp
            except requests.RequestException as exc:
                wait = RETRY_BACKOFF_FACTOR ** attempt
                logger.warning(
                    "Attempt %d/%d failed for %s: %s — retrying in %.1fs",
                    attempt, MAX_RETRIES, url, exc, wait,
                )
                time.sleep(wait)
        logger.error("All %d attempts failed for %s", MAX_RETRIES, url)
        return None


api = APIClient()


# ─── Source 1: Official data.gov.in Open Data API ──────────

def fetch_from_open_data_api(api_key: str | None = None) -> list[dict]:
    """
    Fetch scheme data from India's Open Government Data Platform.

    data.gov.in provides datasets explicitly for public use under
    the Government Open Data License (GODL).
    See: https://data.gov.in/ogpl_apis

    Requires a free API key from https://data.gov.in/
    """
    if not api_key:
        logger.info("No data.gov.in API key provided — skipping API source.")
        logger.info("Get a free key at https://data.gov.in/ to enable this source.")
        return []

    logger.info("Fetching from data.gov.in Open Data API...")
    schemes = []

    # data.gov.in catalog search for scheme-related datasets
    base_url = "https://api.data.gov.in/resource"

    # Example: Search for government scheme catalogs
    # The actual resource IDs change — users should browse data.gov.in
    # and update these with relevant dataset resource IDs
    search_url = "https://api.data.gov.in/catalog"
    params = {
        "api-key": api_key,
        "format": "json",
        "filters[sector]": "Social Development",
        "offset": 0,
        "limit": 100,
    }

    resp = api.get(search_url, params=params)
    if resp and resp.status_code == 200:
        try:
            data = resp.json()
            records = data.get("records", [])
            logger.info("Fetched %d records from data.gov.in", len(records))
            for record in records:
                scheme = _normalize_ogd_record(record)
                if scheme:
                    schemes.append(scheme)
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning("Could not parse data.gov.in response: %s", e)

    logger.info("data.gov.in source yielded %d schemes", len(schemes))
    return schemes


def _normalize_ogd_record(record: dict) -> dict | None:
    """Convert a data.gov.in record to our schema."""
    name = record.get("title", "").strip()
    if not name:
        return None
    return {
        "scheme_id": f"ogd_{record.get('index_name', '')[:20]}",
        "name": name,
        "description": record.get("description", ""),
        "category": record.get("sector", ""),
        "department": record.get("org", ""),
        "eligibilityCriteria": "",
        "benefits": "",
        "applicationProcess": "",
        "requiredDocuments": "",
        "incomeLimit": "",
        "ageLimit": "",
        "genderEligibility": "",
        "occupationEligibility": "",
        "stateSpecific": "",
        "sourceUrl": record.get("source", "https://data.gov.in/"),
        "tags": "",
        "language": "en",
    }


# ─── Source 2: Manually curated seed data ─────────────────

def load_seed_data() -> list[dict]:
    """
    Load the manually curated seed dataset.

    This contains publicly known information about Indian government
    schemes — the same information available in newspapers, press
    releases, and official government announcements.
    """
    seed_path = PROJECT_ROOT / "data" / "schemes.seed.json"
    if not seed_path.exists():
        logger.info("No seed data found at %s", seed_path)
        return []

    with open(seed_path, encoding="utf-8") as f:
        raw = json.load(f)

    schemes = []
    for i, row in enumerate(raw):
        scheme = {
            "scheme_id": f"seed_{i+1:04d}",
            "name": row.get("name", ""),
            "description": row.get("description", ""),
            "category": row.get("category", ""),
            "department": row.get("department", ""),
            "eligibilityCriteria": row.get("eligibilityCriteria", ""),
            "benefits": row.get("benefits", ""),
            "applicationProcess": row.get("applicationProcess", ""),
            "requiredDocuments": row.get("requiredDocuments", ""),
            "incomeLimit": str(row.get("incomeLimit", "")) if row.get("incomeLimit") else "",
            "ageLimit": row.get("ageLimit", ""),
            "genderEligibility": row.get("genderEligibility", ""),
            "occupationEligibility": row.get("occupationEligibility", ""),
            "stateSpecific": row.get("stateSpecific", ""),
            "sourceUrl": row.get("sourceUrl", ""),
            "tags": "",
            "language": "en",
        }
        schemes.append(scheme)

    logger.info("Loaded %d seed schemes", len(schemes))
    return schemes


# ─── Source 3: User-provided imports ──────────────────────

def load_user_imports() -> list[dict]:
    """
    Load any user-provided CSV or JSON files from data/raw/imports/.

    Users can place their own data files here (e.g., from official
    RTI responses, annual reports, or government press releases).
    """
    import_dir = RAW_DIR / "imports"
    import_dir.mkdir(parents=True, exist_ok=True)

    schemes = []

    # Load JSON imports
    for json_file in import_dir.glob("*.json"):
        logger.info("Loading user import: %s", json_file.name)
        try:
            with open(json_file, encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                schemes.extend(data)
            elif isinstance(data, dict):
                schemes.append(data)
        except Exception as e:
            logger.warning("Failed to load %s: %s", json_file, e)

    # Load CSV imports
    for csv_file in import_dir.glob("*.csv"):
        logger.info("Loading user import: %s", csv_file.name)
        try:
            df = pd.read_csv(csv_file, encoding="utf-8")
            schemes.extend(df.to_dict("records"))
        except Exception as e:
            logger.warning("Failed to load %s: %s", csv_file, e)

    if schemes:
        logger.info("Loaded %d schemes from user imports", len(schemes))
    return schemes


# ─── Merge ─────────────────────────────────────────────────

def merge_sources(*sources: list[dict]) -> list[dict]:
    """Merge multiple data sources, deduplicating by name."""
    seen_names: set[str] = set()
    merged: list[dict] = []

    for source in sources:
        for s in source:
            key = s.get("name", "").strip().lower()
            if key and key not in seen_names:
                seen_names.add(key)
                merged.append(s)

    logger.info("Merged total: %d unique schemes", len(merged))
    return merged


# ─── CLI ───────────────────────────────────────────────────

def main():
    logger.info("=" * 60)
    logger.info("GovScheme Data Extraction (Legal Sources Only)")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Sources used:")
    logger.info("  1. Manually curated seed data (public knowledge)")
    logger.info("  2. User-provided imports (data/raw/imports/)")
    logger.info("  3. data.gov.in Open Data API (if API key provided)")
    logger.info("")

    # Load from all legal sources
    seed = load_seed_data()
    imports = load_user_imports()

    # data.gov.in API (optional — needs API key)
    import os
    ogd_key = os.getenv("DATA_GOV_IN_API_KEY", "")
    ogd = fetch_from_open_data_api(ogd_key) if ogd_key else []

    # Merge all sources
    all_schemes = merge_sources(seed, imports, ogd)

    # Save raw output
    raw_path = RAW_DIR / "schemes_raw.json"
    raw_path.write_text(
        json.dumps(all_schemes, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    logger.info("Raw data saved → %s (%d schemes)", raw_path, len(all_schemes))

    # Also save as CSV
    if all_schemes:
        df = pd.DataFrame(all_schemes)
        csv_path = RAW_DIR / "schemes_raw.csv"
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")
        logger.info("Raw CSV saved → %s", csv_path)

    logger.info("Extraction complete ✅")
    return all_schemes


if __name__ == "__main__":
    main()
