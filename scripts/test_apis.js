const fs = require('fs');
const path = require('path');

// Simple dotenv parser
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
const pineconeIndex = env.PINECONE_INDEX_NAME;

console.log('Keys loaded:', { 
  gemini: !!geminiKey, 
  pinecone: !!pineconeKey,
  index: pineconeIndex
});

async function testGemini() {
  console.log('\n--- Testing Gemini API ---');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Respond with exactly the word 'OK'." }] }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Gemini API is Working! Response:', (text || '').trim());
  } catch (err) {
    console.error('❌ Gemini API Error:', err.message);
  }
}

async function testPinecone() {
  console.log('\n--- Testing Pinecone ---');
  try {
    const url = 'https://api.pinecone.io/indexes';
    const response = await fetch(url, {
      headers: {
        'Api-Key': pineconeKey
      }
    });
    const data = await response.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    
    const indexList = data.indexes ? data.indexes.map(i => i.name) : [];
    console.log(`✅ Pinecone API Working! Discovered indexes: ${indexList.join(', ') || 'None'}`);
    
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
  await testGemini();
  await testPinecone();
}

run();
