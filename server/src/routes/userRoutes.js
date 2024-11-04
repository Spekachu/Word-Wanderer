import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validateColor } from '../utils/validators.js';
import { getUserWordAssociations } from '../queries/getUserWordAssociations.js';
import { sendPasswordResetEmail } from '../actions/sendPasswordResetEmail.js';

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
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const user = await prisma.users.findUnique({ where: { user_id: decoded.id } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const accessToken = jwt.sign({ id: user.user_id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
      });

      // Fetch user word associations
      const associationsMap = await getUserWordAssociations(user.user_id);

      res.json({
        accessToken,
        user: { id: user.user_id, email: user.email },
        userWordAssociations: associationsMap
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

const authenticateUser = (req, res, next) => {
	// console.log('Api call requires authentication');
	const authHeader = req.headers['authorization'];
	// console.log('Auth header:', authHeader);

	const token = authHeader && authHeader.split(' ')[1];
	if (!token) {
		console.log('No token found in auth header');
		return res.status(401).json({ message: 'Authentication required' });
	}

	// console.log('Token:', token);

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		
		// Check if token is about to expire (e.g., in less than 5 minutes)
		const tokenExp = decoded.exp * 1000; // convert to milliseconds
		const now = Date.now();
		if (tokenExp - now < 5 * 60 * 1000) {
			// Token is about to expire, generate a new one
			const newToken = generateAccessToken(decoded.id);
			res.set('New-Access-Token', newToken);
		}

		req.user = decoded;
		next();
	} catch (error) {
		console.error('Token verification error:', error);
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token expired', error: error.message });
		}
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
		// console.log('Fetching user word associations');
    if (req.user) {
      const associationsMap = await getUserWordAssociations(req.user.id);
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

// Get user preferences
router.get('/user-preferences/:userId', authenticateUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to user preferences' });
    }

    const userPreferences = await prisma.user_preferences.findUnique({
      where: { user_id: userId }
    });

    if (!userPreferences) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    res.json({
      part_of_speech: userPreferences.part_of_speech,
      cefr_level: userPreferences.cefr_level,
      user_language: userPreferences.user_language,
      learning_language: userPreferences.learning_language,
      zoom_level: userPreferences.zoom_level
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save user preferences
router.post('/user-preferences/:userId', authenticateUser, async (req, res) => {
  try {
    // console.log('Server saving user preferences:', req.body);
    const userId = parseInt(req.params.userId);
    
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to update user preferences' });
    }

    const { part_of_speech, cefr_level, user_language, learning_language, zoom_level } = req.body;

    // Validate inputs (you may want to add more specific validations)
    if (!part_of_speech || !cefr_level || !user_language || !learning_language || !zoom_level) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Build update object only with non-null values
    const updateData = {};
    if (part_of_speech !== null) updateData.part_of_speech = part_of_speech;
    if (cefr_level !== null) updateData.cefr_level = cefr_level;
    if (user_language !== null) updateData.user_language = user_language;
    if (learning_language !== null) updateData.learning_language = learning_language;
    if (zoom_level !== null) updateData.zoom_level = zoom_level;

    const updatedPreferences = await prisma.user_preferences.upsert({
      where: { user_id: userId },
      update: updateData,
      create: {
        user_id: userId,
        part_of_speech,
        cefr_level,
        user_language,
        learning_language,
        zoom_level: zoom_level || 0.75 // Default for new records
      }
    });

    res.json({ message: 'User preferences updated successfully', preferences: updatedPreferences });
  } catch (error) {
    console.error('Server error saving user preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Password 
router.post('/update-password', authenticateUser, async (req, res) => {
	try {
		// console.log('Updating password', req.body);
		const { email, oldPassword, newPassword } = req.body;
		
    // Find user by email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ isValid: false });
    }

		const isPasswordValid = await bcrypt.compare(oldPassword, user.hashed_password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid current password' });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUser = await prisma.users.update({
			where: { user_id: user.user_id },
			data: { hashed_password: hashedPassword },
		});
		res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// forgot password
router.post('/forgot-password', async (req, res) => {
	try {
		const { email } = req.body;
		const user = await prisma.users.findUnique({ where: { email } });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		await sendPasswordResetEmail(email);
		res.status(200).json({ message: 'Password reset email sent' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// reset password
router.post('/reset-password/:token', async (req, res) => {
	try {
		const { password } = req.body;
		const { token } = req.params;
		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		const user = await prisma.users.findUnique({ where: { email: decodedToken.email } });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		await prisma.users.update({
			where: { user_id: user.id },
			data: { password: hashedPassword },
		});
		res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Verify current password
router.post('/verify-password', authenticateUser, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ isValid: false });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    res.json({ isValid: isMatch });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// delete profile
router.delete('/delete-profile', authenticateUser, async (req, res) => {
	try {
		const user = req.user;
		await prisma.users.delete({ where: { user_id: user.id } });
		res.status(200).json({ message: 'Profile deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

export default router;
