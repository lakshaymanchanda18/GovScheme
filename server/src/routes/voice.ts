import { Router } from 'express';

const router = Router();

// Stub voice interface endpoint (text in, text out)
router.post('/query', async (req, res) => {
  const { transcript } = req.body || {};
  if (!transcript) {
    return res.status(400).json({ error: 'transcript is required' });
  }

  res.json({
    reply: `I heard: "${transcript}". Voice processing is a stub right now.`,
    next: 'chatbot'
  });
});

export default router;
