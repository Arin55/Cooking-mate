import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import workoutRoutes from './routes/workouts.js';
import calorieRoutes from './routes/calories.js';
import dietRoutes from './routes/diets.js';
import chatbotRoutes from './routes/chatbot.js';

const __filename = fileURLToPath(import.meta.url);

const app = express();

// Middlewares
// Allow frontend domain in production and localhost in dev
// Dynamically include:
// - FRONTEND_ORIGIN (optional, comma-separated)
// - VERCEL_URL (auto-provided by Vercel, e.g. myapp.vercel.app)
const envFrontends = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const allowedOrigins = [
  ...envFrontends,
  vercelUrl,
  'http://localhost:5000',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // also allow subpaths of Vercel preview URLs (origin matches exact scheme+host)
    if (vercelUrl && origin.startsWith(vercelUrl)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/diets', dietRoutes);

// Static client (optional for local dev)
const clientDir = path.join(__dirname, '..', '..', 'client');
app.use('/client', express.static(clientDir));

// Pretty routes
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(clientDir, 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(clientDir, 'signup.html'));
});
app.get('/profile', (req, res) => {
  res.sendFile(path.join(clientDir, 'profile.html'));
});

export default app;
