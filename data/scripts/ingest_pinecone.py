"""
Phase 5: Ingest schemes into Pinecone.
Generates embeddings using Gemini and upserts to Pinecone vector DB.
"""
import os
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from pinecone import Pinecone
    import google.generativeai as genai
except ImportError:
    print("[ERROR] Missing required packages. Run: pip install pinecone-client google-generativeai")
    sys.exit(1)

# ─── PATHS & ENV ───────────────────────────────────────────────
FINAL_DIR = os.path.join(os.path.dirname(__file__), '..', 'final')
PINECONE_FILE = os.path.join(FINAL_DIR, 'schemes_pinecone.json')

# Load env vars from server/.env
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', 'server', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    os.environ[k] = v

load_env()

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.environ.get('PINECONE_INDEX_NAME', 'gov-schemes')

if not GEMINI_API_KEY or not PINECONE_API_KEY:
    print("[ERROR] Missing GEMINI_API_KEY or PINECONE_API_KEY in server/.env")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)

# ─── INGESTION ────────────────────────────────────────────────

def get_embedding(text):
    """Generate 768-dimensional embedding using Gemini."""
    try:
        # We use task_type=RETRIEVAL_DOCUMENT for the documents being stored
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        # The backend expects 'gemini-embedding-001' but text-embedding-004 is the modern recommended one.
        # Let's try gemini-embedding-001 if the above fails.
        try:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e2:
            print(f"Embedding failed: {e2}")
            return None

def process_batch(batch):
    """Process a batch of records: embed + upsert."""
    vectors = []
    for rec in batch:
        emb = get_embedding(rec['text'])
        if emb:
            vectors.append({
                'id': rec['id'],
                'values': emb,
                'metadata': rec['metadata']
            })
        time.sleep(0.5)  # Rate limit protection
        
    if vectors:
        try:
            index.upsert(vectors=vectors)
            return len(vectors)
        except Exception as e:
            print(f"Upsert failed: {e}")
            return 0
    return 0

def run_ingestion():
    print('=' * 60)
    print('  Pinecone Ingestion Pipeline')
    print('=' * 60)

    if not os.path.exists(PINECONE_FILE):
        print(f"[ERROR] {PINECONE_FILE} not found. Run cleaning script first.")
        sys.exit(1)

    with open(PINECONE_FILE, 'r', encoding='utf-8') as f:
        records = json.load(f)

    # Filter to match only those successfully imported into SQLite if we wanted perfect parity,
    # but having all 1770 in Pinecone is fine too. Let's just do all 1770.
    
    print(f"[INFO] Loaded {len(records)} records to ingest into '{PINECONE_INDEX_NAME}'")
    
    # We will process in batches of 20
    batch_size = 20
    batches = [records[i:i + batch_size] for i in range(0, len(records), batch_size)]
    print(f"[INFO] Split into {len(batches)} batches.")

    total_upserted = 0
    
    for i, batch in enumerate(batches):
        print(f"Processing batch {i+1}/{len(batches)}...")
        success_count = process_batch(batch)
        total_upserted += success_count
        print(f"  Upserted {success_count} vectors. (Total: {total_upserted})")

    print(f"\n[SUCCESS] Pinecone ingestion complete. Upserted {total_upserted} vectors.")

if __name__ == '__main__':
    run_ingestion()
