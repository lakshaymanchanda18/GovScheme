import { Router } from 'express';
import { querySchemes, RAGFilters } from '../services/pineconeRAG';

const router = Router();

router.post('/query', async (req, res) => {
  try {
    const { message, filters } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userQuery = message.trim();

    // Build optional metadata filters from request
    const ragFilters: RAGFilters | undefined = filters
      ? {
          category: filters.category || undefined,
          state: filters.state || undefined,
          income: filters.income ? Number(filters.income) : undefined,
          occupation: filters.occupation || undefined,
        }
      : undefined;

    // Run the full RAG pipeline
    const ragResponse = await querySchemes(userQuery, ragFilters);

    // Build backward-compatible sources array for frontend
    const sources = ragResponse.schemes.map((s) => s.id);
    const sourceScores = ragResponse.schemes.map((s) => ({
      id: s.id,
      confidence: s.relevanceScore,
    }));

    res.json({
      reply: ragResponse.reply,
      schemes: ragResponse.schemes,
      suggestions: ragResponse.suggestions,
      noSchemesFound: ragResponse.noSchemesFound,
      sources,
      sourceScores,
      debugInfo: process.env.NODE_ENV !== 'production' ? ragResponse.debugInfo : undefined,
    });
  } catch (error) {
    console.error('[Chatbot] Route error:', error);
    res.status(500).json({
      error: 'Chatbot failed to respond',
      reply: 'I am experiencing technical difficulties. Please try again.',
      schemes: [],
      suggestions: ['Try asking about farmer schemes', 'Healthcare schemes', 'Education scholarships'],
      noSchemesFound: true,
    });
  }
});

export default router;
