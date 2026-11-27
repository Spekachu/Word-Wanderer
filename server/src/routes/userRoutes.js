import express from 'express';

const router = express.Router();

// Demo mode: database-backed user accounts are disabled
const demoModeResponse = (req, res) => {
  res.status(503).json({
    demoMode: true,
    message: 'User accounts are disabled in single-session Demo Mode. Your progress is saved locally in your browser.'
  });
};

router.post('/refresh-token', (req, res) => {
  res.status(401).json({ demoMode: true, message: 'No active session (Demo Mode)' });
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

router.post('/register', demoModeResponse);
router.post('/login', demoModeResponse);
router.post('/word-association', demoModeResponse);
router.get('/word-associations', (req, res) => res.json({}));
router.delete('/word-association/:word_id', demoModeResponse);
router.get('/check-auth', (req, res) => res.json({ isAuthenticated: false, demoMode: true }));
router.get('/user-preferences/:userId', demoModeResponse);
router.post('/user-preferences/:userId', demoModeResponse);
router.post('/update-password', demoModeResponse);
router.post('/forgot-password', demoModeResponse);
router.post('/reset-password/:token', demoModeResponse);
router.post('/verify-password', demoModeResponse);
router.delete('/delete-profile', demoModeResponse);

export default router;
