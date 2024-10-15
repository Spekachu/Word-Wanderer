# Word Wanderer - Backend

## Project Overview

This repository contains the backend code for the Word Wanderer project, an interactive language learning tool. The backend serves as the data and authentication layer for the Word Wanderer frontend, providing APIs for word retrieval, user management, and data persistence.

## Key Features

- RESTful API for word retrieval with filters for language, CEFR level, and part of speech
- User authentication and authorization system
- Database management for words, translations, and user associations
- API endpoints for saving and retrieving user progress

## Technologies Used

- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **Prisma ORM**: For database operations and migrations
- **PostgreSQL**: Primary database
- **JSON Web Tokens (JWT)**: For secure authentication
- **bcrypt**: For password hashing
- **Stripe.js** (Payments)
- **dotenv** (Environment variables)
- **cors** (CORS handling)

### Possible Technologies if needed
- **Passport.js** (Authentication)
- **Joi** (Validation)
- **Winston** (Logging)
- **Helmet.js** (Security)
- **Swagger** (API documentation)
- **Jest** (Testing)
- **node-cron** (Task scheduling, if needed)
- **Socket.io** (WebSockets, if needed)

## API Structure

Our API is structured around the following main endpoints:

- `/api/words`: Endpoints for retrieving word data
- `/api/users`: User management endpoints
- `/api/auth`: Authentication endpoints

Detailed API documentation is available [here](link-to-your-api-docs).

## Database Schema

The database is structured around several key tables:

- `words`: Stores basic word information
- `words_translations`: Contains translations for each word
- `users`: User account information
- `user__word_associations`: Tracks user learning progress and associations

## Future Development

Upcoming features and improvements include:

- Implementing caching for improved performance
- Expanding the word database and adding more languages
- Enhancing user progress tracking and analytics
