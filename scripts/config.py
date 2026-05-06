"""
config.py — Centralized configuration for the GovScheme data pipeline.

All paths, constants, logging setup, category mappings, and scraping
parameters live here so every other module can import a single source
of truth.
"""

import os
import logging
from pathlib import Path
from datetime import datetime

# ──────────────────────────────────────────────
# Directory structure
# ──────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
FINAL_DIR = DATA_DIR / "final"
LOGS_DIR = PROJECT_ROOT / "logs"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"

# Create directories if they don't exist
for d in [RAW_DIR, PROCESSED_DIR, FINAL_DIR, LOGS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ──────────────────────────────────────────────
# Scraping configuration
# ──────────────────────────────────────────────
SITEMAP_URL = "https://www.myscheme.gov.in/sitemap-0.xml"
SITEMAP_INDEX_URL = "https://www.myscheme.gov.in/sitemap.xml"
BASE_URL = "https://www.myscheme.gov.in"
SCHEME_URL_PREFIX = f"{BASE_URL}/schemes/"

# Rate limiting
REQUEST_DELAY_MIN = 1.0        # minimum seconds between requests
REQUEST_DELAY_MAX = 2.5        # maximum seconds between requests
MAX_RETRIES = 3                # retry count for failed requests
RETRY_BACKOFF_FACTOR = 2.0     # exponential backoff multiplier
REQUEST_TIMEOUT = 30           # seconds

# Pagination
BATCH_SIZE = 50                # schemes to process per batch before saving

# Headers to mimic a real browser
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

# ──────────────────────────────────────────────
# Data schema — canonical field list
# ──────────────────────────────────────────────
SCHEME_FIELDS = [
    "scheme_id",
    "name",
    "description",
    "category",
    "department",
    "eligibilityCriteria",
    "benefits",
    "applicationProcess",
    "requiredDocuments",
    "incomeLimit",
    "ageLimit",
    "genderEligibility",
    "occupationEligibility",
    "stateSpecific",
    "sourceUrl",
    "tags",
    "keywords",
    "embedding_text",
    "language",
    "last_updated",
]

# ──────────────────────────────────────────────
# Category normalization map
# ──────────────────────────────────────────────
CATEGORY_MAP = {
    # Raw / messy → Canonical
    "housing": "Housing",
    "housing & shelter": "Housing",
    "urban housing": "Housing",
    "rural housing": "Housing",
    "financial inclusion": "Financial Inclusion",
    "finance": "Financial Inclusion",
    "banking": "Financial Inclusion",
    "financial services": "Financial Inclusion",
    "agriculture": "Agriculture",
    "farming": "Agriculture",
    "agriculture & allied": "Agriculture",
    "agriculture and farmers welfare": "Agriculture",
    "healthcare": "Healthcare",
    "health": "Healthcare",
    "health & wellness": "Healthcare",
    "health insurance": "Healthcare",
    "medical": "Healthcare",
    "energy": "Energy",
    "power": "Energy",
    "petroleum": "Energy",
    "clean energy": "Energy",
    "renewable energy": "Energy",
    "education": "Education",
    "scholarship": "Education",
    "skill development": "Education",
    "training": "Education",
    "higher education": "Education",
    "business": "Business & Enterprise",
    "enterprise": "Business & Enterprise",
    "entrepreneurship": "Business & Enterprise",
    "msme": "Business & Enterprise",
    "startup": "Business & Enterprise",
    "employment": "Employment",
    "jobs": "Employment",
    "wage employment": "Employment",
    "livelihood": "Employment",
    "women & child": "Women & Child Development",
    "women and child": "Women & Child Development",
    "women": "Women & Child Development",
    "child welfare": "Women & Child Development",
    "maternity": "Women & Child Development",
    "social welfare": "Social Welfare",
    "social security": "Social Welfare",
    "pension": "Social Welfare",
    "disability": "Social Welfare",
    "rural development": "Rural Development",
    "rural": "Rural Development",
    "panchayati raj": "Rural Development",
    "urban development": "Urban Development",
    "urban": "Urban Development",
    "smart city": "Urban Development",
    "sanitation": "Sanitation & Water",
    "water": "Sanitation & Water",
    "drinking water": "Sanitation & Water",
    "swachh bharat": "Sanitation & Water",
    "transport": "Transport & Infrastructure",
    "infrastructure": "Transport & Infrastructure",
    "roads": "Transport & Infrastructure",
    "railways": "Transport & Infrastructure",
    "science & technology": "Science & Technology",
    "technology": "Science & Technology",
    "digital": "Science & Technology",
    "it": "Science & Technology",
    "insurance": "Insurance",
    "life insurance": "Insurance",
    "crop insurance": "Insurance",
    "minority welfare": "Minority Welfare",
    "minority": "Minority Welfare",
    "tribal welfare": "Tribal Welfare",
    "tribal": "Tribal Welfare",
    "scheduled tribe": "Tribal Welfare",
    "scheduled caste": "SC/ST Welfare",
    "sc/st": "SC/ST Welfare",
    "defence": "Defence & Veterans",
    "ex-servicemen": "Defence & Veterans",
    "veteran": "Defence & Veterans",
    "food": "Food & Public Distribution",
    "public distribution": "Food & Public Distribution",
    "ration": "Food & Public Distribution",
    "environment": "Environment",
    "forest": "Environment",
    "climate": "Environment",
    "sports": "Sports & Youth",
    "youth": "Sports & Youth",
    "culture": "Culture & Tourism",
    "tourism": "Culture & Tourism",
    "legal": "Legal Aid",
    "justice": "Legal Aid",
}

# All valid canonical categories
VALID_CATEGORIES = sorted(set(CATEGORY_MAP.values()))

# ──────────────────────────────────────────────
# Logging setup
# ──────────────────────────────────────────────
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")


def get_logger(name: str, log_file: str | None = None) -> logging.Logger:
    """Create a configured logger that writes to both console and file."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Prevent duplicate handlers on re-import
    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    console.setFormatter(formatter)
    logger.addHandler(console)

    # File handler
    if log_file is None:
        log_file = str(LOGS_DIR / f"{name}_{TIMESTAMP}.log")
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger
