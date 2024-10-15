import { Router } from 'express';
import { getWordsWithTranslations } from '../queries/getWords.js';
import jwt from 'jsonwebtoken';
import initModels from '../models/init-models.js';
import sequelize from '../database/connection.js';

const router = Router();

// Initialize models
const models = initModels(sequelize);
const { user_word_associations } = models;

// Middleware to optionally authenticate user
const optionalAuthenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we'll continue as a guest user
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
      const userAssociations = await user_word_associations.findAll({
        where: { user_id: req.user.id },
        attributes: ['word_id', 'emoji', 'highlight_color']
      });

      const associationsMap = userAssociations.reduce((acc, assoc) => {
        acc[assoc.word_id] = { emoji: assoc.emoji, highlight_color: assoc.highlight_color };
        return acc;
      }, {});

      words = words.map(word => ({
        ...word,
        user_association: associationsMap[word.id] || null
      }));
    } else {
      // For guest users, add null user_association
      words = words.map(word => ({ ...word, user_association: null }));
    }

    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve words' });
  }
});

export default router;