# Word Map Project Masterplan

## Goals
1. Create an interactive language learning tool focused on vocabulary acquisition
2. Provide a visual representation of words and their relationships
3. Allow users to personalize their learning experience
4. Support multiple languages and proficiency levels
5. Encourage regular engagement and practice

## Core Concepts
1. Word Map: A visual representation of words, arranged in a meaningful pattern
2. Interactive Words: Clickable word elements that reveal additional information
3. Personalization: User-specific associations (emojis, highlights) for each word
4. Multi-language Support: Ability to switch between different language pairs
5. Proficiency Levels: CEFR levels (A1-C2) to tailor content difficulty
6. Parts of Speech: Filtering words based on grammatical categories

## Tech Specs
1. Frontend:
	- React.js for the user interface
	- React Router for navigation
	- Context API for state management
	- Tailwind CSS for styling
	- i18next for internationalization

2. Backend:
	- Node.js with Express.js
	- Prisma ORM for database interactions
	- JWT for authentication

3. Database:
   - PostgreSQL

4. APIs:
   - Custom API endpoints for word retrieval, user authentication, and word associations

5. Deployment:
   - Render for backend (coupled with frontend) and database

## Feature Roadmap

### Implemented Features
- [x] User Registration and Authentication, Login, Logout, refresh token, access token
- [x] Interactive Word Map with algorithm for placing words in circular shape
- [x] Word Selection and Information Display
- [x] Language Pair Selection
- [x] CEFR Level Selection
- [x] Part of Speech Filtering
- [x] Emoji Association with Words
- [x] Color Highlighting for Words
- [x] Panning and Zooming of Word Map
- [x] User can save progress
- [x] Duplicate words in db with different translations get combined on the frontend
- [x] deployed to render! with custom domain https://www.wordwanderer.app/

### Planned Features

#### Authentication
- [x] (frontend) User Profile page, update password, password reset, delete account 
- [ ] (backend) User Profile page, update password, password reset, delete account 

#### Content Enhancement
- [ ] Word Categories and Themes
  - Group words by related topics or themes
  - Allow users to explore words within specific contexts
- [ ] Contextual Sentences
  - Provide example sentences for each word
  - Possibly using an API, which user would cache the data from
- [x] Pronunciation Practice
  - Integrate text-to-speech functionality for word pronunciation
  [-] User should cache this audio so the API doesn't have to recall (not necessary)
- [-] Unsplash API for associated images, user would cache (not good results)

#### User Experience
- [x] Welcome/home page
  - Would include buttons like "A1 verbs" to go to the word map with those filters already applied
- [ ] Experiment with map, flag, compass icons to enhance exploratory vibes
- [ ] Offline Mode
  - Implement local storage for offline access to learned words
  - Sync data when the user comes back online

#### User Management
- [ ] User language preferences should save to db, to users table, or maybe a user_language_preferences table
- [ ] Free users can save 50 associations
- [ ] Users can upgrade to premium subscription for unlimited associations

#### Data Management
- [x] User caches user-word-associations, so user association changes should update local state, update database via API call, and update their cache of the user-word-associations to include the new changes

#### Integrations
- [ ] Integration with External Resources
  - Connect with online dictionaries or language learning platforms

### Long-term Features

#### Mobile Development
- [ ] Mobile App
  - Develop native mobile applications for iOS and Android
  - Optimize the Word Map interface for touch interactions

#### User Engagement
- [ ] Progress Tracking
  - Visualize user progress across different categories and levels
  - Provide statistics on words learned, accuracy, and time spent
  - Option to view their learned words in a word map

- [ ] Gamification Elements
  - Introduce points, badges, or levels to incentivize regular practice
  - Create daily challenges or quests to engage users
  - Challenge mode: resets map, but still shows user's emojis and highlights, when they click on a word, the content window shows up with multiple choice quiz from related words. Answering wrong highlights their answer in red and show the translation for that word. They can keep trying. Answering right highlights the right answer in green.

#### Social Features
- [ ] Collaborative Learning
  - Allow users to share custom word lists or maps

#### Deployment
- [x] Deploy to Render Production (https://www.wordwanderer.app/)
- [ ] Deploy to Render Stage (https://stage.wordwanderer.app/)
- [ ] Deploy to Render Dev (https://dev.wordwanderer.app/)

