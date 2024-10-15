import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import initModels from '../models/init-models.js';
import sequelize from '../database/connection.js';
import { validateColor } from '../utils/validators.js';

const router = express.Router();

// Initialize models
const models = initModels(sequelize);
const { users, user_word_associations, words } = models;

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await users.create({
      email,
      hashed_password: hashedPassword
    });

    // Create JWT token
    const token = jwt.sign({ id: newUser.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.user_id, email: newUser.email }
    });
  } catch (error) {

    res.status(500).json({ message: 'Server error', error: error.message, reqBody: req.body });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await users.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.user_id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Save user-word association
router.post('/word-association', authenticateUser, async (req, res) => {
  try {
    const { word_id, emoji, highlight_color } = req.body;
    const user_id = req.user.id;

    // Validate inputs
    if (!word_id || !Number.isInteger(word_id)) {
      return res.status(400).json({ message: 'Invalid word_id' });
    }

    if (emoji && emoji.length > 8) {
      return res.status(400).json({ message: 'Emoji too long' });
    }

    if (highlight_color && !validateColor(highlight_color)) {
      return res.status(400).json({ message: 'Invalid highlight color', color: highlight_color });
    }

    // Check if the word exists
    const wordExists = await words.findByPk(word_id);
    if (!wordExists) {
      return res.status(404).json({ message: 'Word not found' });
    }

    const [association, created] = await user_word_associations.findOrCreate({
      where: { user_id, word_id },
      defaults: { emoji, highlight_color },
    });

    if (!created) {
      await association.update({ emoji, highlight_color });
    }

    res.status(200).json({ message: 'Word association saved successfully', association });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user-word associations
router.get('/word-associations', authenticateUser, async (req, res) => {
  try {
    const user_id = req.user.id;

    const associations = await user_word_associations.findAll({
      where: { user_id },
      include: [{
        model: words,
        attributes: ['word_id', 'word_text'] // Assuming 'word_text' is the column name for the actual word
      }]
    });

    res.status(200).json(associations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user-word association
router.delete('/word-association/:word_id', authenticateUser, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { word_id } = req.params;

    const deleted = await user_word_associations.destroy({
      where: { user_id, word_id }
    });

    if (deleted) {
      res.status(200).json({ message: 'Word association deleted successfully' });
    } else {
      res.status(404).json({ message: 'Word association not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;