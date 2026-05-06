"""
Phase 2: Clean, transform, and export the downloaded HuggingFace dataset
into the format required by our GovScheme application.

Input:  data/raw/huggingface_schemes.csv
Output: data/final/schemes_final.json
        data/final/schemes_final.csv
        data/final/schemes_pinecone.json
        data/final/schemes_chunks.json
        data/final/export_stats.json
"""
import os
import re
import json
import hashlib
import pandas as pd
from datetime import datetime

# ─── PATHS ─────────────────────────────────────────────────────
BASE_DIR = os.path.join(os.path.dirname(__file__), '..')
RAW_FILE = os.path.join(BASE_DIR, 'raw', 'huggingface_schemes.csv')
FINAL_DIR = os.path.join(BASE_DIR, 'final')
SEED_FILE = os.path.join(BASE_DIR, 'schemes.seed.json')

# ─── CATEGORY NORMALIZATION MAP ────────────────────────────────
CATEGORY_MAP = {
    'social welfare & empowerment': 'Social Welfare',
    'social welfare and empowerment': 'Social Welfare',
    'social welfare &  empowerment': 'Social Welfare',
    'education & learning': 'Education',
    'education and learning': 'Education',
    'education': 'Education',
    'health & wellness': 'Healthcare',
    'health and wellness': 'Healthcare',
    'healthcare': 'Healthcare',
    'agriculture,rural & environment': 'Agriculture',
    'agriculture, rural & environment': 'Agriculture',
    'agriculture,rural &  environment': 'Agriculture',
    'agriculture': 'Agriculture',
    'business & entrepreneurship': 'Business & Enterprise',
    'business and entrepreneurship': 'Business & Enterprise',
    'business & enterprise': 'Business & Enterprise',
    'skills & employment': 'Employment',
    'skills and employment': 'Employment',
    'employment': 'Employment',
    'housing & shelter': 'Housing',
    'housing and shelter': 'Housing',
    'housing': 'Housing',
    'women and child': 'Women & Child Development',
    'women & child': 'Women & Child Development',
    'women & child development': 'Women & Child Development',
    'science, it & communications': 'Science & Technology',
    'science,it & communications': 'Science & Technology',
    'science & technology': 'Science & Technology',
    'transport & infrastructure': 'Infrastructure',
    'transport and infrastructure': 'Infrastructure',
    'sports & culture': 'Sports & Culture',
    'sports and culture': 'Sports & Culture',
    'financial inclusion': 'Financial Inclusion',
    'banking,financial services and insurance': 'Financial Inclusion',
    'banking, financial services and insurance': 'Financial Inclusion',
    'energy': 'Energy',
    'utility & sanitation': 'Utility & Sanitation',
    'utility and sanitation': 'Utility & Sanitation',
    'public safety,law & justice': 'Public Safety & Justice',
    'public safety, law & justice': 'Public Safety & Justice',
    'travel & tourism': 'Travel & Tourism',
}

# ─── CLEANING FUNCTIONS ───────────────────────────────────────

def clean_html(text):
    """Remove HTML tags, markdown formatting, and excessive whitespace."""
    if pd.isna(text) or not text:
        return ''
    text = str(text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove markdown bold/italic
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    # Fix encoding artifacts (e.g., ÔÇÿ for smart quotes)
    text = text.replace('\u00e2\u0080\u0099', "'")
    text = text.replace('\u00e2\u0080\u009c', '"')
    text = text.replace('\u00e2\u0080\u009d', '"')
    text = text.replace('\u00e2\u0080\u0093', '-')
    text = text.replace('\u00e2\u0080\u0094', '-')
    text = text.replace('â\x80\x99', "'")
    text = text.replace('â\x80\x9c', '"')
    text = text.replace('â\x80\x9d', '"')
    text = text.replace('â\x80\x93', '-')
    text = text.replace('â\x80\x94', '-')
    text = re.sub(r'[\x80-\x9f]', '', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove leading numbered lists formatting for cleaner text
    text = re.sub(r'^\d+\.\s*', '', text)
    return text


def clean_step_text(text):
    """Clean application process text that has Step 01: Step 02: formatting."""
    if pd.isna(text) or not text:
        return ''
    text = str(text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'[\x80-\x9f]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def normalize_category(cat):
    """Map raw category to normalized canonical category."""
    if pd.isna(cat) or not cat:
        return 'General'
    key = str(cat).strip().lower()
    return CATEGORY_MAP.get(key, str(cat).strip().title())


def is_lorem_ipsum(text):
    """Detect lorem ipsum or other placeholder text."""
    if not text:
        return False
    lower = text.lower()
    lorem_markers = [
        'lorem ipsum', 'dolor sit amet', 'consectetur adipiscing',
        'sed do eiusmod', 'ut labore et dolore', 'magna aliqua',
        'campana clamo aestivus', 'cinis vomito allatus',  # fake Latin from previous seed
    ]
    return any(m in lower for m in lorem_markers)


def extract_income_limit(text):
    """Try to extract income limit from eligibility or description text."""
    if not text:
        return None
    # Look for patterns like "₹X lakh", "Rs. X lakh", "income up to X"
    patterns = [
        r'(?:₹|Rs\.?)\s*([\d,.]+)\s*(?:lakh|lakhs)',
        r'income\s+(?:up\s+to|below|not\s+exceeding)\s+(?:₹|Rs\.?)\s*([\d,.]+)',
        r'annual\s+income\s+(?:up\s+to|below)\s+(?:₹|Rs\.?)\s*([\d,.]+)',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            val = m.group(1).replace(',', '')
            try:
                num = float(val)
                # If it mentions "lakh", multiply
                if 'lakh' in text[m.start():m.end()+10].lower():
                    num *= 100000
                return num
            except ValueError:
                continue
    return None


def generate_scheme_id(name):
    """Generate a deterministic ID from scheme name."""
    clean = re.sub(r'[^a-z0-9]', '', name.lower())
    return 'sch_' + hashlib.md5(clean.encode()).hexdigest()[:12]


# ─── MAIN PIPELINE ────────────────────────────────────────────

def run():
    print('=' * 60)
    print('  GovScheme Data Cleaning Pipeline')
    print('=' * 60)

    # 1. Load raw data
    print(f'\n[1/7] Loading raw data from {RAW_FILE}...')
    df = pd.read_csv(RAW_FILE, encoding='latin-1')
    print(f'  Loaded {len(df)} rows, {len(df.columns)} columns')
    print(f'  Columns: {list(df.columns)}')

    # 2. Drop rows with empty scheme names
    print(f'\n[2/7] Removing empty/invalid records...')
    initial = len(df)
    df = df.dropna(subset=['scheme_name'])
    df = df[df['scheme_name'].str.strip().str.len() > 3]
    print(f'  Removed {initial - len(df)} rows with empty/short names -> {len(df)} remaining')

    # 3. Remove duplicates
    print(f'\n[3/7] Removing duplicate scheme names...')
    before = len(df)
    df = df.drop_duplicates(subset=['scheme_name'], keep='first')
    print(f'  Removed {before - len(df)} duplicates -> {len(df)} remaining')

    # 4. Remove lorem ipsum / fake content
    print(f'\n[4/7] Detecting and removing fake/placeholder content...')
    fake_mask = df['brief_description'].apply(is_lorem_ipsum) | df['scheme_name'].apply(is_lorem_ipsum)
    n_fake = fake_mask.sum()
    if n_fake > 0:
        print(f'  [WARN] Found {n_fake} records with placeholder text — removing')
        df = df[~fake_mask]
    else:
        print(f'  No fake/lorem ipsum content detected')

    # 5. Clean and transform columns
    print(f'\n[5/7] Cleaning and transforming data...')

    schemes = []
    skipped = 0

    for _, row in df.iterrows():
        name = clean_html(row.get('scheme_name', ''))
        if not name or len(name) < 5:
            skipped += 1
            continue

        description = clean_html(row.get('detailed_description') or row.get('brief_description', ''))
        if not description or len(description) < 20:
            # Use brief if detailed is empty
            description = clean_html(row.get('brief_description', ''))
        if not description or len(description) < 20:
            skipped += 1
            continue

        category = normalize_category(row.get('category', ''))
        department = clean_html(row.get('nodal_ministry') or row.get('implementing_agency', ''))
        if not department:
            department = 'Government of India'

        eligibility = clean_html(row.get('eligibility_criteria', ''))
        benefits = clean_html(row.get('benefits', ''))
        app_process = clean_step_text(row.get('application_process', ''))
        req_docs = clean_html(row.get('documents_required', ''))

        state = str(row.get('state', '')).strip() if pd.notna(row.get('state')) else 'All States'
        if not state or state.lower() in ['nan', '']:
            state = 'All States'

        source_url = str(row.get('Official Website', '')).strip() if pd.notna(row.get('Official Website')) else None
        if source_url and not source_url.startswith('http'):
            source_url = None

        income_limit = extract_income_limit(eligibility + ' ' + description)

        # Build the embedding text for RAG
        embedding_text = f"""Scheme Name: {name}
Description: {description[:500]}
Category: {category}
Department: {department}
State: {state}
Eligibility: {eligibility[:400]}
Benefits: {benefits[:400]}
Application Process: {app_process[:300]}
Required Documents: {req_docs[:300]}"""

        scheme = {
            'name': name,
            'description': description[:2000],  # Cap at 2000 chars
            'category': category,
            'department': department,
            'eligibilityCriteria': eligibility[:1500],
            'benefits': benefits[:1500],
            'applicationProcess': app_process[:1000],
            'requiredDocuments': req_docs[:1000],
            'sourceUrl': source_url,
            'incomeLimit': income_limit,
            'ageLimit': None,
            'familySizeLimit': None,
            'stateSpecific': state,
            'isActive': True,
            'embedding_text': embedding_text,
            'tags': clean_html(row.get('tags', '')),
            'level': str(row.get('level', '')).strip() if pd.notna(row.get('level')) else 'Central',
        }
        schemes.append(scheme)

    print(f'  Transformed {len(schemes)} schemes ({skipped} skipped due to missing data)')

    # 6. Final deduplication by name (after cleaning)
    print(f'\n[6/7] Final deduplication...')
    seen_names = set()
    unique_schemes = []
    for s in schemes:
        norm = s['name'].lower().strip()
        if norm not in seen_names:
            seen_names.add(norm)
            unique_schemes.append(s)
    print(f'  {len(schemes)} -> {len(unique_schemes)} after final dedup')
    schemes = unique_schemes

    # 7. Export
    print(f'\n[7/7] Exporting to {FINAL_DIR}...')
    os.makedirs(FINAL_DIR, exist_ok=True)

    # --- schemes_final.json (for DB import) ---
    db_schemes = [{k: v for k, v in s.items() if k not in ('embedding_text', 'tags', 'level')} for s in schemes]
    final_json_path = os.path.join(FINAL_DIR, 'schemes_final.json')
    with open(final_json_path, 'w', encoding='utf-8') as f:
        json.dump(db_schemes, f, indent=2, ensure_ascii=False)
    print(f'  [OK] schemes_final.json ({len(db_schemes)} schemes)')

    # --- schemes_final.csv ---
    df_out = pd.DataFrame(db_schemes)
    csv_path = os.path.join(FINAL_DIR, 'schemes_final.csv')
    df_out.to_csv(csv_path, index=False, encoding='utf-8')
    print(f'  [OK] schemes_final.csv')

    # --- schemes_pinecone.json (for Pinecone ingestion) ---
    pinecone_records = []
    for s in schemes:
        rec_id = generate_scheme_id(s['name'])
        pinecone_records.append({
            'id': rec_id,
            'text': s['embedding_text'],
            'metadata': {
                'name': s['name'],
                'category': s['category'],
                'department': s['department'],
                'stateSpecific': s['stateSpecific'],
                'sourceUrl': s.get('sourceUrl', ''),
                'incomeLimit': str(s.get('incomeLimit', '')) if s.get('incomeLimit') else '',
                'ageLimit': s.get('ageLimit', ''),
                'level': s.get('level', ''),
                'tags': s.get('tags', ''),
            }
        })
    pinecone_path = os.path.join(FINAL_DIR, 'schemes_pinecone.json')
    with open(pinecone_path, 'w', encoding='utf-8') as f:
        json.dump(pinecone_records, f, indent=2, ensure_ascii=False)
    print(f'  [OK] schemes_pinecone.json ({len(pinecone_records)} records)')

    # --- schemes.seed.json (update the DB seed file) ---
    with open(SEED_FILE, 'w', encoding='utf-8') as f:
        json.dump(db_schemes, f, indent=2, ensure_ascii=False)
    print(f'  [OK] schemes.seed.json (updated)')

    # --- export_stats.json ---
    categories = sorted(set(s['category'] for s in schemes))
    states = sorted(set(s['stateSpecific'] for s in schemes))
    avg_emb_len = sum(len(s['embedding_text']) for s in schemes) / max(len(schemes), 1)
    stats = {
        'exported_at': datetime.now().isoformat(),
        'total_schemes': len(schemes),
        'categories': categories,
        'category_counts': {c: sum(1 for s in schemes if s['category'] == c) for c in categories},
        'states': states[:20],  # Top 20
        'state_counts': {st: sum(1 for s in schemes if s['stateSpecific'] == st) for st in states[:20]},
        'avg_description_length': round(sum(len(s['description']) for s in schemes) / max(len(schemes), 1), 1),
        'avg_embedding_text_length': round(avg_emb_len, 1),
        'schemes_with_url': sum(1 for s in schemes if s.get('sourceUrl')),
        'files_generated': [
            'schemes_final.json', 'schemes_final.csv',
            'schemes_pinecone.json', 'schemes.seed.json'
        ]
    }
    stats_path = os.path.join(FINAL_DIR, 'export_stats.json')
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    print(f'  [OK] export_stats.json')

    # Print summary
    print(f'\n{"=" * 60}')
    print(f'  PIPELINE COMPLETE')
    print(f'{"=" * 60}')
    print(f'  Total schemes: {len(schemes)}')
    print(f'  Categories: {len(categories)}')
    print(f'  States: {len(states)}')
    print(f'  With official URL: {stats["schemes_with_url"]}')
    print(f'  Avg description: {stats["avg_description_length"]} chars')
    print(f'  Avg embedding text: {stats["avg_embedding_text_length"]} chars')
    print(f'\n  Top categories:')
    for c, count in sorted(stats['category_counts'].items(), key=lambda x: -x[1])[:10]:
        print(f'    {c}: {count}')

    return schemes


if __name__ == '__main__':
    run()
