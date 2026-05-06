import pandas as pd
import os
from dotenv import load_dotenv
from pinecone import Pinecone
import google.generativeai as genai

# Load env (your .env is inside server/)
load_dotenv("server/.env")

print("PINECONE_API_KEY =", os.getenv("PINECONE_API_KEY"))
print("GEMINI_API_KEY =", os.getenv("GEMINI_API_KEY"))
print("INDEX =", os.getenv("PINECONE_INDEX_NAME"))

# Setup APIs
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

# Load dataset
df = pd.read_csv("data/schemes.seed.csv")

# Clean NaN values (IMPORTANT)
df = df.fillna("")

def create_context(row):
    return f"""
    Scheme Name: {row.get('name', '')}
    Description: {row.get('description', '')}
    Category: {row.get('category', '')}
    Department: {row.get('department', '')}
    Eligibility: {row.get('eligibilityCriteria', '')}
    Benefits: {row.get('benefits', '')}
    Application Process: {row.get('applicationProcess', '')}
    Required Documents: {row.get('requiredDocuments', '')}
    """


def get_embedding(text):
    response = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        output_dimensionality=768
    )
    # The response is typically a dictionary with an 'embedding' key
    return response.get("embedding", []) if isinstance(response, dict) else response.embedding

batch = []

for i, row in df.iterrows():
    try:
        context = create_context(row)
        embedding = get_embedding(context)

        batch.append({
            "id": str(i),
            "values": embedding,
            "metadata": {
                "text": context
            }
        })

        # Batch upload
        if len(batch) >= 100:
            index.upsert(vectors=batch)
            print(f"Uploaded {i+1} records...")
            batch = []

    except Exception as e:
        print(f"Error at row {i}: {e}")

# Final upload
if batch:
    index.upsert(vectors=batch)

print("✅ Upload complete")