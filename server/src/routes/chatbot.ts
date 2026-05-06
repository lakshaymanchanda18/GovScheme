import { Router } from 'express';
import { prisma } from '../config/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const router = Router();

const detectIntent = (message: string) => {
  const text = message.toLowerCase();
  if (text.includes('eligibility') || text.includes('eligible')) return 'eligibility';
  if (text.includes('scheme') || text.includes('yojana')) return 'schemes';
  if (text.includes('document') || text.includes('required')) return 'documents';
  if (text.includes('status') || text.includes('track')) return 'status';
  if (text.includes('apply') || text.includes('application')) return 'apply';
  return 'general';
};

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const buildTfIdf = (docs: string[]) => {
  const termFreqs = docs.map((d) => {
    const terms = tokenize(d);
    const tf: Record<string, number> = {};
    terms.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
    return tf;
  });
  const df: Record<string, number> = {};
  termFreqs.forEach((tf) => {
    Object.keys(tf).forEach((t) => (df[t] = (df[t] || 0) + 1));
  });
  const idf: Record<string, number> = {};
  const total = docs.length || 1;
  Object.keys(df).forEach((t) => {
    idf[t] = Math.log(total / (1 + df[t]));
  });
  return { termFreqs, idf };
};

const scoreQuery = (query: string, docs: string[], tfidf: ReturnType<typeof buildTfIdf>) => {
  const qTerms = tokenize(query);
  const qTf: Record<string, number> = {};
  qTerms.forEach((t) => (qTf[t] = (qTf[t] || 0) + 1));

  const scores = docs.map((_d, i) => {
    let score = 0;
    Object.keys(qTf).forEach((t) => {
      const tf = tfidf.termFreqs[i][t] || 0;
      const idf = tfidf.idf[t] || 0;
      score += tf * idf;
    });
    return score;
  });
  return scores;
};

router.post('/query', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const intent = detectIntent(message);
    let reply = 'I can help you discover schemes, check eligibility, and track applications. What would you like to do?';
    const suggestions: string[] = [];

    if (intent === 'eligibility') {
      reply = 'You can check eligibility by answering a few questions. Want to start an eligibility check?';
      suggestions.push('Check my eligibility', 'Recommended schemes');
    }

    if (intent === 'schemes' || intent === 'general') {
      const schemes = await prisma.governmentScheme.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          benefits: true,
          eligibilityCriteria: true,
          requiredDocuments: true
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      const docs = schemes.map((s) =>
        `${s.name} ${s.benefits} ${s.eligibilityCriteria} ${s.requiredDocuments}`
      );
      const tfidf = buildTfIdf(docs);
      const scores = scoreQuery(message, docs, tfidf);

      const ranked = schemes
        .map((s, i) => ({ ...s, score: scores[i] }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      const maxScore = ranked[0]?.score || 0;
      const sources = ranked.filter((r) => r.score > 0).map((r) => r.id);
      const sourceScores = ranked
        .filter((r) => r.score > 0)
        .map((r) => ({
          id: r.id,
          confidence: maxScore > 0 ? Math.round((r.score / maxScore) * 100) : 0
        }));

      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
          const schemeSummaries = ranked.slice(0, 5).map(r => `- ${r.name}: ${r.benefits} (Criteria: ${r.eligibilityCriteria})`).join('\\n');
          const prompt = `You are a helpful Indian government schemes assistant. 
User message: "${message}"

Here is the database of ALL available schemes:
${schemeSummaries}

Provide a helpful, conversational response to the user's query. Suggest checking eligibility if applicable. Do not use markdown styling. Keep it under 3 sentences. If they ask about students, mention student-related schemes from the database.`;
          const result = await model.generateContent(prompt);
          reply = result.response.text().trim();
        } catch (error) {
          console.error('Gemini chatbot error:', error);
          if (ranked.length && ranked[0].score > 0) {
            reply = `Here are schemes that match your query: ${ranked.filter(r => r.score > 0).map(r => r.name).join(', ')}.`;
          } else {
            reply = 'I can help you find schemes. Try telling me your category or department.';
          }
        }
      } else {
        if (ranked.length && ranked[0].score > 0) {
          reply = `Here are schemes that match your query: ${ranked.filter(r => r.score > 0).map(r => r.name).join(', ')}.`;
        } else {
          reply = 'I can help you find schemes. Try telling me your category or department.';
        }
      }
      suggestions.push('Show me all schemes', 'Schemes for students');
      return res.json({ reply, suggestions, sources, sourceScores });
    }

    if (intent === 'documents') {
      reply = 'Documents usually include ID proof, address proof, and income certificates. Want help with document upload?';
      suggestions.push('Upload documents', 'Track my application');
    }

    if (intent === 'status') {
      reply = 'You can track your application status from the Applications page. Want to open it now?';
      suggestions.push('Track my application', 'View my applications');
    }

    if (intent === 'apply') {
      reply = 'You can apply directly from any scheme’s details page. Want to see available schemes?';
      suggestions.push('View schemes', 'Check eligibility');
    }

    res.json({ reply, suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Chatbot failed to respond' });
  }
});

export default router;
