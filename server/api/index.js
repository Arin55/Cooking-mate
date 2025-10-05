import { config as loadEnv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../src/app.js';
import { connectDB } from '../src/lib/db.js';

// Ensure .env is loaded in development; on Vercel use dashboard envs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnv({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB once per serverless instance
let connected = false;
async function ensureDB() {
  if (!connected) {
    await connectDB();
    connected = true;
  }
}

// Vercel Node.js runtime version
export const config = { runtime: 'nodejs20.x' };

// Wrap app to ensure DB connection before handling requests
export default async function handler(req, res) {
  try {
    await ensureDB();
  } catch (e) {
    console.error('DB connect failed:', e);
    res.statusCode = 500;
    return res.end('Database connection failed');
  }
  return app(req, res);
}
