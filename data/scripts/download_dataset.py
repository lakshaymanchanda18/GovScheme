"""
Phase 1: Download the HuggingFace Indian Government Schemes dataset.
Source: https://huggingface.co/datasets/abhisshek0077/Indian_government_Schemes_For_People
"""
import os
import requests
import sys

RAW_DIR = os.path.join(os.path.dirname(__file__), '..', 'raw')
OUTPUT_FILE = os.path.join(RAW_DIR, 'huggingface_schemes.csv')
DATASET_URL = (
    'https://huggingface.co/datasets/abhisshek0077/'
    'Indian_government_Schemes_For_People/resolve/main/'
    'Indian_Govenment_Scheme.csv'
)

def download():
    os.makedirs(RAW_DIR, exist_ok=True)

    if os.path.exists(OUTPUT_FILE) and os.path.getsize(OUTPUT_FILE) > 100_000:
        print(f'[SKIP] File already exists: {OUTPUT_FILE} ({os.path.getsize(OUTPUT_FILE):,} bytes)')
        return OUTPUT_FILE

    print(f'[DOWNLOAD] Fetching dataset from HuggingFace...')
    print(f'  URL: {DATASET_URL}')

    resp = requests.get(DATASET_URL, stream=True, timeout=120)
    resp.raise_for_status()

    total = int(resp.headers.get('content-length', 0))
    downloaded = 0

    with open(OUTPUT_FILE, 'wb') as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded / total * 100
                print(f'\r  Progress: {downloaded:,}/{total:,} bytes ({pct:.1f}%)', end='', flush=True)

    print(f'\n[DONE] Saved to {OUTPUT_FILE} ({os.path.getsize(OUTPUT_FILE):,} bytes)')
    return OUTPUT_FILE

if __name__ == '__main__':
    try:
        path = download()
        # Quick peek at the file
        import pandas as pd
        # Try multiple encodings
        for enc in ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']:
            try:
                df = pd.read_csv(path, encoding=enc, nrows=5)
                print(f'\n[INFO] Successfully read with encoding: {enc}')
                print(f'[INFO] Columns: {list(df.columns)}')
                print(f'[INFO] Shape (first 5): {df.shape}')
                # Read full file to get count
                df_full = pd.read_csv(path, encoding=enc)
                print(f'[INFO] Total rows: {len(df_full)}')
                print(f'\n[SAMPLE] First row:')
                for col in df.columns:
                    val = str(df.iloc[0][col])[:100]
                    print(f'  {col}: {val}')
                break
            except (UnicodeDecodeError, pd.errors.ParserError) as e:
                print(f'  [WARN] Encoding {enc} failed: {e}')
                continue

    except Exception as e:
        print(f'[ERROR] {e}', file=sys.stderr)
        sys.exit(1)
