"""
clean_data.py — Preprocessing pipeline for government scheme data.

Handles:
  - Duplicate removal
  - Null value handling
  - Whitespace normalization
  - Category standardization
  - HTML tag removal
  - URL validation
  - embedding_text generation for RAG
  - Keyword extraction
  - Chunk preparation
"""

import json
import re
import hashlib
from pathlib import Path
from urllib.parse import urlparse

import pandas as pd

from config import (
    RAW_DIR, PROCESSED_DIR, CATEGORY_MAP, VALID_CATEGORIES,
    SCHEME_FIELDS, get_logger,
)

logger = get_logger("cleaner")


# ─── Text cleaning utilities ──────────────────────────────

def strip_html(text: str) -> str:
    """Remove any residual HTML tags from text."""
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", " ", str(text))
    clean = re.sub(r"&[a-zA-Z]+;", " ", clean)   # HTML entities
    clean = re.sub(r"&#\d+;", " ", clean)
    return clean.strip()


def normalize_whitespace(text: str) -> str:
    """Collapse multiple whitespace chars into single spaces."""
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def clean_text(text: str) -> str:
    """Full cleaning pipeline for a single text field."""
    if not text or (isinstance(text, float)):
        return ""
    text = str(text)
    text = strip_html(text)
    text = normalize_whitespace(text)
    # Remove control characters
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text


def is_valid_url(url: str) -> bool:
    """Check whether a URL is well-formed."""
    if not url:
        return False
    try:
        result = urlparse(url)
        return all([result.scheme in ("http", "https"), result.netloc])
    except Exception:
        return False


# ─── Category normalization ───────────────────────────────

def normalize_category(raw: str) -> str:
    """Map a raw category string to a canonical value."""
    if not raw:
        return "General"
    key = raw.strip().lower()
    if key in CATEGORY_MAP:
        return CATEGORY_MAP[key]
    # Fuzzy match: check if any canonical category is a substring
    for pattern, canonical in CATEGORY_MAP.items():
        if pattern in key or key in pattern:
            return canonical
    return raw.strip().title()


# ─── Keyword extraction ──────────────────────────────────

# Curated stop-words for scheme text
_STOP = set(
    "the a an is are was were be been being have has had do does did will "
    "would shall should may might can could of in to for on with at by from "
    "as into through during before after above below between out off over "
    "under again further then once and but or nor not so yet both either "
    "neither each every all any few more most other some such no only own "
    "same than too very this that these those it its he she they them their "
    "we our you your who whom which what where when how up about also "
    "government scheme india indian apply eligible".split()
)


def extract_keywords(text: str, top_n: int = 10) -> str:
    """Extract top-N keywords from text using simple TF ranking."""
    if not text:
        return ""
    words = re.findall(r"[a-zA-Z]{3,}", text.lower())
    freq: dict[str, int] = {}
    for w in words:
        if w not in _STOP:
            freq[w] = freq.get(w, 0) + 1
    ranked = sorted(freq, key=freq.get, reverse=True)[:top_n]
    return ", ".join(ranked)


# ─── Embedding text builder ──────────────────────────────

def build_embedding_text(row: dict) -> str:
    """Create the optimized embedding_text field for RAG ingestion."""
    parts = []
    if row.get("name"):
        parts.append(f"Scheme Name: {row['name']}")
    if row.get("description"):
        parts.append(f"Description: {row['description']}")
    if row.get("category"):
        parts.append(f"Category: {row['category']}")
    if row.get("department"):
        parts.append(f"Department: {row['department']}")
    if row.get("eligibilityCriteria"):
        parts.append(f"Eligibility: {row['eligibilityCriteria']}")
    if row.get("benefits"):
        parts.append(f"Benefits: {row['benefits']}")
    if row.get("applicationProcess"):
        parts.append(f"Application Process: {row['applicationProcess']}")
    if row.get("requiredDocuments"):
        parts.append(f"Required Documents: {row['requiredDocuments']}")
    if row.get("stateSpecific"):
        parts.append(f"State: {row['stateSpecific']}")
    if row.get("ageLimit"):
        parts.append(f"Age Limit: {row['ageLimit']}")
    if row.get("incomeLimit"):
        parts.append(f"Income Limit: {row['incomeLimit']}")
    if row.get("genderEligibility"):
        parts.append(f"Gender Eligibility: {row['genderEligibility']}")
    return "\n".join(parts)


# ─── Chunk preparation for RAG ────────────────────────────

def prepare_chunks(row: dict, max_chunk_size: int = 500) -> list[dict]:
    """Split a scheme into overlapping chunks suitable for vector ingestion."""
    full_text = build_embedding_text(row)
    if len(full_text) <= max_chunk_size:
        return [{"scheme_id": row["scheme_id"], "chunk_index": 0,
                 "chunk_text": full_text}]

    words = full_text.split()
    chunks = []
    chunk_words: list[str] = []
    char_count = 0
    idx = 0

    for word in words:
        if char_count + len(word) + 1 > max_chunk_size and chunk_words:
            chunks.append({
                "scheme_id": row["scheme_id"],
                "chunk_index": idx,
                "chunk_text": " ".join(chunk_words),
            })
            # 20 % overlap
            overlap = max(1, len(chunk_words) // 5)
            chunk_words = chunk_words[-overlap:]
            char_count = sum(len(w) + 1 for w in chunk_words)
            idx += 1
        chunk_words.append(word)
        char_count += len(word) + 1

    if chunk_words:
        chunks.append({
            "scheme_id": row["scheme_id"],
            "chunk_index": idx,
            "chunk_text": " ".join(chunk_words),
        })

    return chunks


# ─── Main cleaning pipeline ──────────────────────────────

def clean_schemes(schemes: list[dict]) -> list[dict]:
    """Run the full cleaning pipeline on a list of scheme dicts."""
    logger.info("Starting cleaning pipeline on %d schemes", len(schemes))

    cleaned: list[dict] = []
    seen_names: set[str] = set()

    for row in schemes:
        # 1) Clean all text fields
        for field in ("name", "description", "eligibilityCriteria", "benefits",
                      "applicationProcess", "requiredDocuments", "department",
                      "stateSpecific", "ageLimit", "genderEligibility",
                      "occupationEligibility", "tags"):
            row[field] = clean_text(row.get(field, ""))

        # 2) Skip if no name
        if not row.get("name"):
            logger.debug("Skipping row with no name")
            continue

        # 3) Deduplicate by normalized name
        name_key = row["name"].strip().lower()
        if name_key in seen_names:
            logger.debug("Duplicate skipped: %s", row["name"])
            continue
        seen_names.add(name_key)

        # 4) Normalize category
        row["category"] = normalize_category(row.get("category", ""))

        # 5) Validate and fix URL
        url = row.get("sourceUrl", "")
        if not is_valid_url(url):
            row["sourceUrl"] = "https://www.myscheme.gov.in/"
            logger.debug("Fixed invalid URL for %s", row["name"])

        # 6) Handle income limit
        income = row.get("incomeLimit", "")
        if income:
            # Extract numeric value if present
            nums = re.findall(r"[\d,]+", str(income).replace(",", ""))
            if nums:
                row["incomeLimit"] = nums[0]
            else:
                row["incomeLimit"] = str(income)

        # 7) Ensure scheme_id exists
        if not row.get("scheme_id"):
            row["scheme_id"] = hashlib.md5(
                row["name"].encode()
            ).hexdigest()[:12]

        # 8) Generate embedding_text
        row["embedding_text"] = build_embedding_text(row)

        # 9) Extract keywords
        combined = f"{row['name']} {row['description']} {row['benefits']} {row['eligibilityCriteria']}"
        row["keywords"] = extract_keywords(combined)

        # 10) Set defaults
        row.setdefault("language", "en")
        row.setdefault("last_updated", "")

        cleaned.append(row)

    logger.info("Cleaning complete: %d → %d schemes", len(schemes), len(cleaned))
    return cleaned


def main():
    logger.info("=" * 60)
    logger.info("Starting data cleaning pipeline")
    logger.info("=" * 60)

    # Load raw data
    raw_path = RAW_DIR / "schemes_raw.json"
    if not raw_path.exists():
        logger.error("Raw data not found at %s — run scrape_schemes.py first", raw_path)
        return

    with open(raw_path, encoding="utf-8") as f:
        raw_schemes = json.load(f)

    # Clean
    cleaned = clean_schemes(raw_schemes)

    # Save processed JSON
    out_json = PROCESSED_DIR / "schemes_cleaned.json"
    out_json.write_text(
        json.dumps(cleaned, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    logger.info("Cleaned JSON → %s", out_json)

    # Save processed CSV
    df = pd.DataFrame(cleaned)
    out_csv = PROCESSED_DIR / "schemes_cleaned.csv"
    df.to_csv(out_csv, index=False, encoding="utf-8-sig")
    logger.info("Cleaned CSV → %s", out_csv)

    # Generate chunks
    all_chunks: list[dict] = []
    for scheme in cleaned:
        all_chunks.extend(prepare_chunks(scheme))

    chunks_path = PROCESSED_DIR / "schemes_chunks.json"
    chunks_path.write_text(
        json.dumps(all_chunks, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    logger.info("Chunks → %s (%d chunks from %d schemes)",
                chunks_path, len(all_chunks), len(cleaned))

    logger.info("Cleaning pipeline complete ✅")
    return cleaned


if __name__ == "__main__":
    main()
