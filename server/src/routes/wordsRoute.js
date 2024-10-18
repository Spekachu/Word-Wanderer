import { Router } from 'express';
import { getWordsWithTranslations } from '../queries/getWords.js';

const router = Router();

router.get('/words', async (req, res) => {
  try {
    const sourceLanguage = req.query.sourceLanguage || 'en';
    const targetLanguage = req.query.targetLanguage || 'de';
    const level = req.query.level || 'a1';
    const partOfSpeech = req.query.partOfSpeech || 'verb';

    let words = await getWordsWithTranslations(level, partOfSpeech, sourceLanguage, targetLanguage);

		res.set('Access-Token', req.accessToken);
    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve words' });
  }
});

export default router;