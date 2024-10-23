import { Router } from 'express';
import { getWordsWithTranslations } from '../queries/getWords.js';
import crypto from 'crypto';

const router = Router();

router.get('/words', async (req, res) => {
  try {
    const sourceLanguage = req.query.sourceLanguage || 'en';
    const targetLanguage = req.query.targetLanguage || 'de';
    const level = req.query.level || 'a1';
    const partOfSpeech = req.query.partOfSpeech || 'verb';

    let words = await getWordsWithTranslations(level, partOfSpeech, sourceLanguage, targetLanguage);
    
    // Generate an ETag based on the response content
    const etag = crypto.createHash('md5').update(JSON.stringify(words)).digest('hex');
    
    // Set cache control headers
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.set('ETag', `"${etag}"`);
    res.set('Last-Modified', new Date().toUTCString());

    // Check if the client sent an If-None-Match header
    if (req.headers['if-none-match'] === `"${etag}"`) {
      return res.status(304).end(); // Not Modified
    }

    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve words' });
  }
});

export default router;