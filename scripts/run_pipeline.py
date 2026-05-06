"""
run_pipeline.py — Master orchestrator for the full data pipeline.

Usage:
    python scripts/run_pipeline.py              # full pipeline
    python scripts/run_pipeline.py --skip-scrape # skip scraping, use existing raw data
    python scripts/run_pipeline.py --seed-only   # only process seed data (no web scraping)
"""

import sys
import argparse
import json
import time
from datetime import datetime

from config import RAW_DIR, PROCESSED_DIR, FINAL_DIR, LOGS_DIR, get_logger

logger = get_logger("pipeline")


def run_full_pipeline(skip_scrape: bool = False, seed_only: bool = False):
    """Execute the entire pipeline end-to-end."""
    start = time.time()

    logger.info("╔" + "═" * 58 + "╗")
    logger.info("║   GovScheme RAG Dataset Pipeline                         ║")
    logger.info("║   Started: %-46s║", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    logger.info("╚" + "═" * 58 + "╝")

    # ── Phase 1: Extraction ──────────────────────────
    if seed_only:
        logger.info("\n▶ Phase 1: Loading seed data only (--seed-only)")
        from scrape_schemes import load_seed_data
        schemes = load_seed_data()
        raw_path = RAW_DIR / "schemes_raw.json"
        raw_path.write_text(
            json.dumps(schemes, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        logger.info("  Seed data saved → %s (%d schemes)", raw_path, len(schemes))
    elif skip_scrape:
        logger.info("\n▶ Phase 1: Skipped (--skip-scrape)")
        raw_path = RAW_DIR / "schemes_raw.json"
        if not raw_path.exists():
            logger.error("  No raw data found! Run without --skip-scrape first.")
            return
    else:
        logger.info("\n▶ Phase 1: Data Extraction")
        from scrape_schemes import main as extract
        extract()

    # ── Phase 2: Cleaning ────────────────────────────
    logger.info("\n▶ Phase 2: Data Cleaning & Preprocessing")
    from clean_data import main as clean
    clean()

    # ── Phase 3: Validation ──────────────────────────
    logger.info("\n▶ Phase 3: Validation & Quality Checks")
    from validate_data import main as validate
    validate()

    # ── Phase 4: Export ──────────────────────────────
    logger.info("\n▶ Phase 4: Final Export")
    from export_dataset import main as export
    export()

    # ── Summary ──────────────────────────────────────
    elapsed = time.time() - start
    logger.info("")
    logger.info("╔" + "═" * 58 + "╗")
    logger.info("║   Pipeline Complete ✅                                    ║")
    logger.info("║   Duration: %-45s║", f"{elapsed:.1f}s")
    logger.info("╚" + "═" * 58 + "╝")

    # Print output files
    logger.info("\nOutput files:")
    for d in [RAW_DIR, PROCESSED_DIR, FINAL_DIR]:
        for f in sorted(d.glob("*")):
            if f.is_file():
                size = f.stat().st_size
                unit = "KB" if size > 1024 else "B"
                val = size / 1024 if size > 1024 else size
                logger.info("  %s (%.1f %s)", f.relative_to(d.parent.parent), val, unit)


def main():
    parser = argparse.ArgumentParser(
        description="GovScheme RAG Dataset Pipeline"
    )
    parser.add_argument(
        "--skip-scrape", action="store_true",
        help="Skip web scraping, use existing raw data",
    )
    parser.add_argument(
        "--seed-only", action="store_true",
        help="Only process seed data (no web scraping)",
    )
    args = parser.parse_args()

    run_full_pipeline(
        skip_scrape=args.skip_scrape,
        seed_only=args.seed_only,
    )


if __name__ == "__main__":
    main()
