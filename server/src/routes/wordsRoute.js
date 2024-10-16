import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getWordsWithTranslations } from '../queries/getWords.js';
import { getUserWordAssociations } from '../queries/getUserWordAssociations.js';

const router = Router();

// Middleware to optionally authenticate user
const optionalAuthenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      console.log('Invalid token, continuing as guest');
    }
  }
  next();
};

router.get('/words', optionalAuthenticateUser, async (req, res) => {
  try {
    const sourceLanguage = req.query.sourceLanguage || 'en';
    const targetLanguage = req.query.targetLanguage || 'de';
    const level = req.query.level || 'a1';
    const partOfSpeech = req.query.partOfSpeech || 'verb';

    let words = await getWordsWithTranslations(level, partOfSpeech, sourceLanguage, targetLanguage);

    // If user is authenticated, fetch and merge user associations
    if (req.user) {
      const associationsMap = await getUserWordAssociations(req.user.id);

      words = words.map(word => ({
        ...word,
        userAssociation: associationsMap[word.id] || null
      }));
    } else {
      // For guest users, add null userAssociation
      words = words.map(word => ({ ...word, userAssociation: null }));
    }

    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve words' });
  }
});

export default router;