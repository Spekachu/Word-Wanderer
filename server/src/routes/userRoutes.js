import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validateColor } from '../utils/validators.js';
import { getUserWordAssociations } from '../queries/getUserWordAssociations.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        email,
        hashed_password: hashedPassword
      }
    });

    // Generate access token and refresh token
    const accessToken = generateAccessToken(newUser.user_id);
    const refreshToken = generateRefreshToken(newUser.user_id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send access token and user info in response
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.user_id, email: newUser.email },
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, reqBody: req.body });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Change this from 'strict' to 'lax'
      path: '/', // Ensure the cookie is sent for all paths
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ accessToken, user: { id: user.user_id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refresh token endpoint
router.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    console.log('Refresh token missing');
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(decoded.id);
    console.log('New access token generated for user:', decoded.id);
    res.json({ accessToken });
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader); // Log the entire header

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in auth header');
    return res.status(401).json({ message: 'Authentication required' });
  }

  console.log('Token:', token); // Log the extracted token

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

// Save user-word association
router.post('/word-association', authenticateUser, async (req, res) => {
  try {
    const { word_id, emoji, highlight_color, language_code } = req.body;
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

		if (!language_code || typeof language_code !== 'string' || language_code.length !== 2) {
			return res.status(400).json({ message: 'Invalid language code', language_code: language_code });
		}

		const validLanguageCodes = ['en', 'de', 'fr', 'es']; // Add all valid language codes
		if (!validLanguageCodes.includes(language_code.toLowerCase())) {
			return res.status(400).json({ message: 'Unsupported language code', language_code: language_code });
		}

    // Check if the word exists
    const wordExists = await prisma.words.findUnique({ where: { word_id: word_id } });
    if (!wordExists) {
      return res.status(404).json({ message: 'Word not found' });
    }

    const association = await prisma.user_word_associations.upsert({
      where: {
        user_id_word_id: {
          user_id: user_id,
          word_id: word_id
        }
      },
      update: {
        emoji,
        highlight_color: highlight_color,
				language_codes: {
					push: language_code
				}
      },
      create: {
        user_id: user_id,
        word_id: word_id,
        emoji,
        highlight_color: highlight_color,
				language_codes: language_code ? [language_code] : []
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
    if (req.user) {
      const associationsMap = await getUserWordAssociations(req.user.id);
      res.set('Access-Token', req.accessToken);
      res.json(associationsMap);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve user word associations' });
  }
});

// Delete user-word association
router.delete('/word-association/:word_id', authenticateUser, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { word_id } = req.params;

    const deleted = await prisma.user_word_associations.deleteMany({
      where: { user_id: user_id, word_id: parseInt(word_id) }
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

router.get('/check-auth', authenticateUser, (req, res) => {
  res.json({ isAuthenticated: true, user: { id: req.user.id } });
});

export default router;
