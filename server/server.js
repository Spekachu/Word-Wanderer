import express from 'express';
import cors from 'cors';

const port = 5000;

import wordsRoute from './src/routes/wordsRoute.js';
import userRoutes from './src/routes/userRoutes.js';

const start = async () => {
	const app = express();

	// Middleware
	app.use(express.static('public'));
	app.use(cors({
		origin: process.env.FRONTEND_URL || 'http://localhost:3000'
	}));
	app.use(express.json());

	// API routes
	app.use('/api', wordsRoute);
	app.use('/api/users', userRoutes);

	app.use('/static', express.static('public'));

	app.listen(port, '0.0.0.0', () => {
		console.log(`Server running at http://0.0.0.0:${port}`);
	});
}

start();