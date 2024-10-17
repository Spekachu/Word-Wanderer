import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';

const port = 5000;
const prisma = new PrismaClient();

import wordsRoute from './src/routes/wordsRoute.js';
import userRoutes from './src/routes/userRoutes.js';

const start = async () => {
  const app = express();

  // Middleware
	app.use(cookieParser());
  app.use(express.static('public'));
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

  app.use('/static', express.static('public'));

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

start()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });