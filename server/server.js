import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV !== 'production';
const port = isDevelopment ? (process.env.DEV_PORT || 5000) : (process.env.PORT || 8080);

import wordsRoute from './src/routes/wordsRoute.js';
import userRoutes from './src/routes/userRoutes.js';

const start = async () => {
  const app = express();

  // Middleware
	app.use(cookieParser());
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());

  // API routes
  app.use('/api', wordsRoute);
  app.use('/api/user', userRoutes);

  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));
	// The "catchall" handler: for any request that doesn't
	// match one above, send back React's index.html file.
	app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
	});

  app.listen(port, '0.0.0.0', () => {
		console.log(`Server running in ${isDevelopment ? 'development' : 'production'} mode at http://localhost:${port}`);
  });
}

start()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
