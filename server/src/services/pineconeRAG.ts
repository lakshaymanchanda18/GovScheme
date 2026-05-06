/**
 * Pinecone RAG Service — Real Retrieval-Augmented Generation for Government Schemes.
 *
 * Pipeline:
 *   User query → Gemini embedding → Pinecone vector search → grounded context → Gemini LLM → structured response
 *
 * This service NEVER invents schemes. Every scheme in the response comes from Pinecone metadata.
 */
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

// ─── TYPES ────────────────────────────────────────────────────

export interface RetrievedScheme {
  id: string;
  schemeName: string;
  category: string;
  department: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  requiredDocuments: string;
  sourceUrl: string;
  stateSpecific: string;
  ageLimit: string;
  incomeLimit: string;
  relevanceScore: number;
  whyRelevant: string;
}

export interface RAGResponse {
  reply: string;
  schemes: RetrievedScheme[];
  suggestions: string[];
  noSchemesFound: boolean;
  debugInfo?: {
    pineconeScores: Array<{ id: string; score: number }>;
    retrievedCount: number;
    queryEmbeddingDim: number;
    promptLength: number;
  };
}

export interface RAGFilters {
  category?: string;
  state?: string;
  income?: number;
  occupation?: string;
}

// ─── INITIALIZATION ───────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || '';
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'gov-schemes';

let pineconeIndex: ReturnType<Pinecone['index']> | null = null;
let genAI: GoogleGenerativeAI | null = null;

function initClients() {
  if (!genAI && GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('[RAG] Gemini AI client initialized');
  }

  if (!pineconeIndex && PINECONE_API_KEY) {
    try {
      const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
      pineconeIndex = pc.index(PINECONE_INDEX_NAME);
      console.log(`[RAG] Pinecone index "${PINECONE_INDEX_NAME}" connected`);
    } catch (error) {
      console.error('[RAG] Pinecone initialization failed:', error);
    }
  }
}

// Initialize on module load
initClients();

// ─── EMBEDDING GENERATION ─────────────────────────────────────

/**
 * Generate a 768-dim embedding for the user query using gemini-embedding-001
 * (same model used during ingestion in ingest.py).
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  if (!genAI) throw new Error('Gemini AI not initialized — check GEMINI_API_KEY');

  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  const result = await model.embedContent({
    content: { parts: [{ text: query }], role: 'user' },
    taskType: TaskType.RETRIEVAL_QUERY,
    outputDimensionality: 768,
  } as any); // using 'as any' just in case the types are missing the parameter, though it worked in testing

  const embedding: number[] = result.embedding.values;

  console.log(`[RAG] Generated embedding: dim=${embedding.length} for query="${query.substring(0, 60)}..."`);
  return embedding;
}

// ─── PINECONE QUERY ───────────────────────────────────────────

/**
 * Query Pinecone for top-k matching scheme vectors.
 * Optionally apply metadata filters.
 */
async function queryPinecone(
  embedding: number[],
  topK: number = 5,
  filters?: RAGFilters
): Promise<Array<{ id: string; score: number; metadata: Record<string, any> }>> {
  if (!pineconeIndex) throw new Error('Pinecone not initialized — check PINECONE_API_KEY');

  // Build metadata filter if provided
  const filter: Record<string, any> = {};
  if (filters?.category) {
    filter['category'] = { $eq: filters.category };
  }
  if (filters?.state) {
    filter['stateSpecific'] = { $eq: filters.state };
  }

  const queryRequest: any = {
    vector: embedding,
    topK,
    includeMetadata: true,
  };

  // Only add filter if non-empty
  if (Object.keys(filter).length > 0) {
    queryRequest.filter = filter;
  }

  const result = await pineconeIndex.query(queryRequest);

  const matches = (result.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: (match.metadata || {}) as Record<string, any>,
  }));

  console.log(`[RAG] Pinecone returned ${matches.length} matches:`);
  matches.forEach((m) => {
    const name = m.metadata.name || m.metadata.text?.substring(0, 50) || m.id;
    console.log(`  [${m.id}] score=${m.score.toFixed(4)} → ${name}`);
  });

  return matches;
}

// ─── CONTEXT CONSTRUCTION ─────────────────────────────────────

/**
 * Extract structured scheme data from Pinecone metadata.
 * Handles both formats: structured metadata fields and text-blob metadata.
 */
function extractSchemeFromMetadata(
  id: string,
  metadata: Record<string, any>,
  score: number
): RetrievedScheme {
  // If metadata has structured fields (from schemes_pinecone.json format)
  if (metadata.name) {
    return {
      id,
      schemeName: metadata.name || 'Unknown Scheme',
      category: metadata.category || '',
      department: metadata.department || '',
      eligibility: extractFromText(metadata.text, 'Eligibility') || '',
      benefits: extractFromText(metadata.text, 'Benefits') || '',
      applicationProcess: extractFromText(metadata.text, 'Application Process') || '',
      requiredDocuments: extractFromText(metadata.text, 'Required Documents') || '',
      sourceUrl: metadata.sourceUrl || '',
      stateSpecific: metadata.stateSpecific || '',
      ageLimit: metadata.ageLimit || '',
      incomeLimit: metadata.incomeLimit || '',
      relevanceScore: Math.round(score * 100),
      whyRelevant: '', // Filled by LLM later
    };
  }

  // Fallback: parse from text blob (ingest.py format)
  const text = metadata.text || '';
  return {
    id,
    schemeName: extractFromText(text, 'Scheme Name') || `Scheme ${id}`,
    category: extractFromText(text, 'Category') || '',
    department: extractFromText(text, 'Department') || '',
    eligibility: extractFromText(text, 'Eligibility') || '',
    benefits: extractFromText(text, 'Benefits') || '',
    applicationProcess: extractFromText(text, 'Application Process') || '',
    requiredDocuments: extractFromText(text, 'Required Documents') || '',
    sourceUrl: '',
    stateSpecific: extractFromText(text, 'State') || '',
    ageLimit: extractFromText(text, 'Age Limit') || '',
    incomeLimit: extractFromText(text, 'Income Limit') || '',
    relevanceScore: Math.round(score * 100),
    whyRelevant: '',
  };
}

/** Extract a field value from a text blob like "Field Name: value\n" */
function extractFromText(text: string, fieldName: string): string {
  if (!text) return '';
  const regex = new RegExp(`${fieldName}:\\s*(.+?)(?:\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Build the grounded context string from retrieved schemes.
 */
function buildGroundedContext(schemes: RetrievedScheme[]): string {
  if (schemes.length === 0) return 'NO SCHEMES FOUND IN DATABASE.';

  return schemes
    .map(
      (s, i) => `
--- SCHEME ${i + 1} (Relevance: ${s.relevanceScore}%) ---
Scheme Name: ${s.schemeName}
Category: ${s.category}
Department: ${s.department}
Eligibility: ${s.eligibility}
Benefits: ${s.benefits}
Application Process: ${s.applicationProcess}
Required Documents: ${s.requiredDocuments}
State: ${s.stateSpecific}
Age Limit: ${s.ageLimit}
Income Limit: ${s.incomeLimit}
Source: ${s.sourceUrl}
`.trim()
    )
    .join('\n\n');
}

// ─── STRICT SYSTEM PROMPT ─────────────────────────────────────

const SYSTEM_PROMPT = `You are SaralYojna AI, an official Indian government schemes assistant.

STRICT RULES — FOLLOW EXACTLY:
1. ONLY answer using the scheme data provided in the CONTEXT section below.
2. NEVER invent, fabricate, or hallucinate scheme names, benefits, eligibility rules, or any other information.
3. If the context contains relevant schemes, explain them clearly with their real names, benefits, and eligibility.
4. For each scheme you mention, explain WHY it is relevant to the user's query.
5. If NO relevant schemes are found in the context, say exactly: "I could not find relevant schemes matching your query in our database."
6. Then ask clarifying questions about the user's age, income, state, occupation, or category to help narrow the search.
7. Do NOT use markdown formatting. Use plain text with clear structure.
8. Keep responses concise — max 4-5 sentences per scheme.
9. Always mention the scheme's official name exactly as provided in the context.

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "reply": "Your natural language response to the user",
  "schemeRelevance": [
    {
      "schemeName": "Exact scheme name from context",
      "whyRelevant": "Brief explanation of why this scheme matches the user's query"
    }
  ],
  "suggestions": ["Follow-up question 1", "Follow-up question 2"]
}`;

// ─── LLM GENERATION ───────────────────────────────────────────

/**
 * Send the grounded context + user query to Gemini and get a structured response.
 */
async function generateGroundedResponse(
  userQuery: string,
  context: string,
  schemes: RetrievedScheme[]
): Promise<{ reply: string; schemes: RetrievedScheme[]; suggestions: string[] }> {
  if (!genAI) {
    // Fallback without LLM — just return raw scheme data
    return buildFallbackResponse(schemes);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `${SYSTEM_PROMPT}

=== CONTEXT (Retrieved from government scheme database) ===
${context}
=== END CONTEXT ===

User Query: "${userQuery}"

Respond with the JSON object as specified. Do not include any text outside the JSON.`;

  console.log(`[RAG] Prompt length: ${prompt.length} chars`);

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse JSON from response (handle markdown code blocks)
    const jsonStr = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Merge whyRelevant from LLM into scheme objects
    const enrichedSchemes = schemes.map((scheme) => {
      const relevance = parsed.schemeRelevance?.find(
        (r: any) => r.schemeName === scheme.schemeName
      );
      return {
        ...scheme,
        whyRelevant: relevance?.whyRelevant || '',
      };
    });

    return {
      reply: parsed.reply || 'Here are the relevant government schemes I found.',
      schemes: enrichedSchemes,
      suggestions: parsed.suggestions || [],
    };
  } catch (error) {
    console.error('[RAG] Gemini generation failed:', error);
    return buildFallbackResponse(schemes);
  }
}

/**
 * Build a response without LLM — just present the raw scheme data.
 */
function buildFallbackResponse(schemes: RetrievedScheme[]): {
  reply: string;
  schemes: RetrievedScheme[];
  suggestions: string[];
} {
  if (schemes.length === 0) {
    return {
      reply: 'I could not find relevant schemes matching your query in our database. Could you tell me more about your age, income, state, or occupation so I can search better?',
      schemes: [],
      suggestions: ['Schemes for farmers', 'Schemes for students', 'Healthcare schemes', 'Housing schemes'],
    };
  }

  const schemeNames = schemes.map((s) => s.schemeName).join(', ');
  return {
    reply: `Based on your query, I found these relevant government schemes: ${schemeNames}. Check the scheme cards below for details.`,
    schemes,
    suggestions: ['Tell me more about eligibility', 'How to apply?', 'Show other categories'],
  };
}

// ─── MAIN PUBLIC API ──────────────────────────────────────────

/** Minimum Pinecone score to consider a match relevant */
const RELEVANCE_THRESHOLD = 0.3;

/**
 * Main entry point: run the full RAG pipeline for a user query.
 */
export async function querySchemes(
  userQuery: string,
  filters?: RAGFilters
): Promise<RAGResponse> {
  console.log(`\n[RAG] ════════════════════════════════════════`);
  console.log(`[RAG] Query: "${userQuery}"`);
  console.log(`[RAG] Filters:`, filters || 'none');

  // Ensure clients are ready
  initClients();

  if (!pineconeIndex || !genAI) {
    console.error('[RAG] Missing Pinecone or Gemini client');
    return {
      reply: 'The scheme search system is temporarily unavailable. Please try again later.',
      schemes: [],
      suggestions: [],
      noSchemesFound: true,
    };
  }

  try {
    // Step 1: Generate embedding for user query
    const embedding = await generateQueryEmbedding(userQuery);

    // Step 2: Query Pinecone
    const matches = await queryPinecone(embedding, 5, filters);

    // Step 3: Filter by relevance threshold and deduplicate
    const relevantMatches = matches.filter((m) => m.score >= RELEVANCE_THRESHOLD);
    const seenNames = new Set<string>();
    const deduped = relevantMatches.filter((m) => {
      const name = m.metadata.name || extractFromText(m.metadata.text || '', 'Scheme Name');
      if (seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    });

    console.log(`[RAG] After filtering: ${deduped.length}/${matches.length} matches above threshold ${RELEVANCE_THRESHOLD}`);

    // Step 4: Extract structured scheme data
    const schemes = deduped.map((m) => extractSchemeFromMetadata(m.id, m.metadata, m.score));

    // Step 5: Build grounded context
    const context = buildGroundedContext(schemes);

    // Step 6: Generate grounded LLM response
    const { reply, schemes: enrichedSchemes, suggestions } = await generateGroundedResponse(
      userQuery,
      context,
      schemes
    );

    const debugInfo = {
      pineconeScores: matches.map((m) => ({ id: m.id, score: Math.round(m.score * 10000) / 10000 })),
      retrievedCount: deduped.length,
      queryEmbeddingDim: embedding.length,
      promptLength: context.length,
    };

    console.log(`[RAG] Response: ${enrichedSchemes.length} schemes, reply length=${reply.length}`);
    console.log(`[RAG] ════════════════════════════════════════\n`);

    return {
      reply,
      schemes: enrichedSchemes,
      suggestions,
      noSchemesFound: enrichedSchemes.length === 0,
      debugInfo,
    };
  } catch (error) {
    console.error('[RAG] Pipeline error:', error);
    return {
      reply: 'I encountered an error while searching for schemes. Please try rephrasing your query.',
      schemes: [],
      suggestions: ['Schemes for farmers', 'Education scholarships', 'Healthcare schemes'],
      noSchemesFound: true,
    };
  }
}
