import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validateColor } from '../utils/validators.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword
      }
    });

    // Create JWT token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, email: newUser.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, reqBody: req.body });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
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
    const wordExists = await prisma.word.findUnique({ where: { id: word_id } });
    if (!wordExists) {
      return res.status(404).json({ message: 'Word not found' });
    }

    const association = await prisma.user_word_association.upsert({
      where: {
        userId_wordId: {
          userId: user_id,
          wordId: word_id
        }
      },
      update: {
        emoji,
        highlightColor: highlight_color
      },
      create: {
        userId: user_id,
        wordId: word_id,
        emoji,
        highlightColor: highlight_color
      }
    });

    res.status(200).json({ message: 'Word association saved successfully', association });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user-word associations
router.get('/word-associations', authenticateUser, async (req, res) => {
  try {
    const user_id = req.user.id;

    const associations = await prisma.user_word_association.findMany({
      where: { userId: user_id },
      include: {
        word: {
          select: {
            id: true,
            text: true // Assuming 'text' is the field name for the actual word
          }
        }
      }
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

    const deleted = await prisma.user_word_association.deleteMany({
      where: { userId: user_id, wordId: parseInt(word_id) }
    });

    if (deleted.count > 0) {
      res.status(200).json({ message: 'Word association deleted successfully' });
    } else {
      res.status(404).json({ message: 'Word association not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;