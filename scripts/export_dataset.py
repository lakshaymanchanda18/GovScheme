"""
export_dataset.py — Final export to CSV and JSON for Pinecone / RAG ingestion.

Produces:
  - data/final/schemes_final.json
  - data/final/schemes_final.csv
  - data/final/schemes_pinecone.json   (ready for vector DB)
  - data/final/schemes_chunks.json     (chunked for long-doc RAG)
"""

import json
from datetime import datetime

import pandas as pd

from config import PROCESSED_DIR, FINAL_DIR, SCHEME_FIELDS, get_logger

logger = get_logger("exporter")


def export_final(schemes: list[dict]):
    """Write final cleaned dataset in multiple formats."""
    logger.info("Exporting %d schemes to final/", len(schemes))

    # ── JSON ─────────────────────────────────────────
    json_path = FINAL_DIR / "schemes_final.json"
    json_path.write_text(
        json.dumps(schemes, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    logger.info("JSON → %s", json_path)

    # ── CSV ──────────────────────────────────────────
    df = pd.DataFrame(schemes)
    csv_path = FINAL_DIR / "schemes_final.csv"
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    logger.info("CSV  → %s", csv_path)

    # ── Pinecone-ready format ────────────────────────
    pinecone_records = []
    for s in schemes:
        record = {
            "id": s.get("scheme_id", ""),
            "metadata": {
                "name": s.get("name", ""),
                "category": s.get("category", ""),
                "department": s.get("department", ""),
                "stateSpecific": s.get("stateSpecific", ""),
                "sourceUrl": s.get("sourceUrl", ""),
                "ageLimit": s.get("ageLimit", ""),
                "incomeLimit": s.get("incomeLimit", ""),
                "genderEligibility": s.get("genderEligibility", ""),
                "keywords": s.get("keywords", ""),
                "language": s.get("language", "en"),
                "text": s.get("embedding_text", ""),
            },
        }
        pinecone_records.append(record)

    pinecone_path = FINAL_DIR / "schemes_pinecone.json"
    pinecone_path.write_text(
        json.dumps(pinecone_records, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    logger.info("Pinecone JSON → %s (%d records)", pinecone_path, len(pinecone_records))

    # ── Copy chunks ──────────────────────────────────
    chunks_src = PROCESSED_DIR / "schemes_chunks.json"
    if chunks_src.exists():
        chunks_dst = FINAL_DIR / "schemes_chunks.json"
        chunks_dst.write_text(chunks_src.read_text(encoding="utf-8"), encoding="utf-8")
        logger.info("Chunks → %s", chunks_dst)

    # ── Stats ────────────────────────────────────────
    stats = {
        "exported_at": datetime.now().isoformat(),
        "total_schemes": len(schemes),
        "categories": sorted(set(s.get("category", "") for s in schemes)),
        "avg_embedding_text_length": (
            sum(len(s.get("embedding_text", "")) for s in schemes) / max(len(schemes), 1)
        ),
        "files_generated": [
            str(json_path.name),
            str(csv_path.name),
            str(pinecone_path.name),
            "schemes_chunks.json",
        ],
    }
    stats_path = FINAL_DIR / "export_stats.json"
    stats_path.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    logger.info("Stats → %s", stats_path)


def main():
    logger.info("=" * 60)
    logger.info("Starting export pipeline")
    logger.info("=" * 60)

    data_path = PROCESSED_DIR / "schemes_cleaned.json"
    if not data_path.exists():
        logger.error("Cleaned data not found — run clean_data.py first")
        return

    with open(data_path, encoding="utf-8") as f:
        schemes = json.load(f)

    export_final(schemes)
    logger.info("Export pipeline complete ✅")


if __name__ == "__main__":
    main()
