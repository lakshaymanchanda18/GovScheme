import os
from dotenv import load_dotenv
from pinecone import Pinecone
import google.generativeai as genai

# Load env
load_dotenv("server/.env")

print("Key Check:")
print(f"GEMINI_API_KEY: {'Loaded' if os.getenv('GEMINI_API_KEY') else 'Not Found'}")
print(f"PINECONE_API_KEY: {'Loaded' if os.getenv('PINECONE_API_KEY') else 'Not Found'}")
print("-" * 30)

# Check Gemini
print("Testing Gemini API...")
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    # test a simple model call
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("Say 'Hello'")
    if response and response.text:
        print(f"✅ Gemini API is Working! Response: '{response.text.strip()}'")
    else:
        print("❌ Gemini API returned empty response.")
except Exception as e:
    print(f"❌ Gemini API Error: {e}")

# Check Pinecone
print("-" * 30)
print("Testing Pinecone API...")
try:
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    indexes = pc.list_indexes()
    index_names = [idx.name for idx in indexes]  # Adjusted depending on pinecone client version
    print(f"✅ Pinecone API is Working! Total Indexes listed: {len(index_names)}")
    if index_names:
        print(f"Indexes: {index_names}")
    
    index_name = os.getenv("PINECONE_INDEX_NAME")
    if index_name in index_names:
        index = pc.Index(index_name)
        stats = index.describe_index_stats()
        print(f"✅ Index '{index_name}' is accessible. Stats: {stats}")
    else:
        print(f"⚠️ Index '{index_name}' configured in .env but not found in your Pinecone account.")
except Exception as e:
    print(f"❌ Pinecone API Error: {e}")
