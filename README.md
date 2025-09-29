# CookFit - Cooking & Fitness Web App

A full-stack app with a modern, responsive UI for discovering recipes, tracking workouts and calories, and a simple recipe chatbot.

## Tech
- Frontend: HTML, CSS, JavaScript, Bootstrap 5, Chart.js
- Backend: Node.js, Express, MongoDB (Mongoose)

## Structure
- `client/` – static frontend (open HTML files directly or serve via a static server)
- `server/` – API server with routes, models, controllers, middleware

## Getting Started (Backend)
1. Copy `.env.example` to `.env` in `server/` and set values:
   - `PORT=5000`
   - `MONGODB_URI=mongodb://localhost:27017/cooking_fitness`
   - `JWT_SECRET=your_secret`
2. Install dependencies (run in `server/`):
   ```bash
   npm install
   ```
3. Seed data (optional):
   ```bash
   npm run seed
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
5. Test endpoints:
   - Health: `GET /api/health`
   - Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
   - Recipes: `GET /api/recipes`, `POST /api/recipes` (auth)
   - Workouts: `GET/POST /api/workouts` (auth)
   - Calories: `GET/POST /api/calories` (auth)
   - Chatbot: `POST /api/chatbot`

## Frontend Usage
- Open `client/index.html` in your browser. Ensure the backend is running at the same origin (same host/port) for API calls.
- Alternatively, serve `client/` via a static server pointing to the backend origin.

## Notes
- Demo auth is used by UI to quickly test protected routes. Run seeder first or sign up a new user.
- TheMealDB is called directly from backend at `/api/recipes/external` and `/api/chatbot`.
