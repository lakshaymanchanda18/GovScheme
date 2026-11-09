const fs = require('fs');
const path = require('path');

// Read env variables
const envPath = path.join(__dirname, '../server/.env');
console.log(`Reading env from ${envPath}`);
const env = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || '';
      val = val.replace(/^['"](.*)['"]$/, '$1').trim();
      acc[match[1]] = val;
    }
    return acc;
  }, {});

const geminiKey = env.GEMINI_API_KEY;
const pineconeKey = env.PINECONE_API_KEY;
const pineconeIndex = env.PINECONE_INDEX_NAME || 'gov-schemes';

console.log('Keys loaded:', { 
  gemini: !!geminiKey, 
  pinecone: !!pineconeKey,
  index: pineconeIndex
});

async function testGeminiModels() {
  console.log('\n--- 1. Testing Gemini 1.5 Flash Model ---');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Respond with exactly: OK_GEMINI_ONLINE" }] }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Gemini 1.5 Flash is Working! Response:', (text || '').trim());
  } catch (err) {
    console.error('❌ Gemini 1.5 Flash Error:', err.message);
  }
}

async function testGeminiEmbeddings() {
  console.log('\n--- 2. Testing Gemini Embedding (text-embedding-004) ---');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text: "Indian agricultural subsidy scheme" }] },
        outputDimensionality: 768
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const values = data.embedding?.values;
    console.log(`✅ Embedding Generated! Dimension: ${values ? values.length : 0}`);
    return values;
  } catch (err) {
    console.error('❌ Embedding Generation Error:', err.message);
    return null;
  }
}

async function testPinecone(sampleVector) {
  console.log('\n--- 3. Testing Pinecone Connectivity & Vector Search ---');
  try {
    const url = 'https://api.pinecone.io/indexes';
    const response = await fetch(url, {
      headers: { 'Api-Key': pineconeKey }
    });
    const data = await response.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    
    const indexList = data.indexes ? data.indexes.map(i => i.name) : [];
    console.log(`✅ Pinecone API Working! Available indexes: ${indexList.join(', ') || 'None'}`);
    
    if (indexList.includes(pineconeIndex)) {
      console.log(`✅ Required index '${pineconeIndex}' is present!`);
      const indexInfo = data.indexes.find(i => i.name === pineconeIndex);
      if (indexInfo?.host) {
        const statsUrl = `https://${indexInfo.host}/describe_index_stats`;
        const statsRes = await fetch(statsUrl, {
          method: 'POST',
          headers: { 'Api-Key': pineconeKey, 'Content-Type': 'application/json' }
        });
        if (statsRes.ok) {
           const stats = await statsRes.json();
           console.log(`✅ Index Stats for '${pineconeIndex}': Total vectors: ${stats.totalVectorCount}, Dimension: ${stats.dimension}`);
           
           if (sampleVector && stats.totalVectorCount > 0) {
             const queryUrl = `https://${indexInfo.host}/query`;
             const queryRes = await fetch(queryUrl, {
               method: 'POST',
               headers: { 'Api-Key': pineconeKey, 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 vector: sampleVector,
                 topK: 2,
                 includeMetadata: true
               })
             });
             if (queryRes.ok) {
               const queryData = await queryRes.json();
               console.log(`✅ Vector Query Success! Retrieved ${queryData.matches?.length || 0} matching schemes:`);
               queryData.matches?.forEach(m => {
                 console.log(`   - [ID: ${m.id}] Score: ${m.score.toFixed(4)} | Name: ${m.metadata?.name || m.metadata?.schemeName || 'N/A'}`);
               });
             }
           }
        } else {
           console.log(`⚠️ Could not fetch stats: ${statsRes.status}`);
        }
      }
    } else {
      console.log(`⚠️ Index '${pineconeIndex}' not found in your Pinecone account.`);
    }

  } catch (err) {
    console.error('❌ Pinecone API Error:', err.message);
  }
}

async function run() {
  await testGeminiModels();
  const vector = await testGeminiEmbeddings();
  await testPinecone(vector);
  console.log('\n--- RAG & AI Verification Complete ---\n');
}

run();
