import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getWordsWithTranslations } from '../queries/getWords.js';
import { getUserWordAssociations } from '../queries/getUserWordAssociations.js';

const router = Router();

// Middleware to optionally authenticate user
const optionalAuthenticateUser = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      req.user = { id: decoded.id };
      req.accessToken = accessToken;
    } catch (error) {
      console.log('Invalid or expired refresh token, continuing as guest');
      res.clearCookie('refreshToken');
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

      // Include the new access token in the response
      res.set('Access-Token', req.accessToken);
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