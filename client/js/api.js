// Basic API helper
// In production (Vercel), we want same-origin so rewrites proxy /api -> backend.
// In local dev (served from a non-5000 port), hit Express on :5000.
const isLocal = /localhost|127\.0\.0\.1/.test(location.hostname);
// Use same-origin in production; Vercel routes /api/* to serverless function
export const API_BASE = isLocal ? 'http://localhost:5000' : '';
export const tokenKey = 'cookfit_token';

export function getToken(){ return localStorage.getItem(tokenKey) || ''; }
export function setToken(t){ localStorage.setItem(tokenKey, t); }
export function logout(){ localStorage.removeItem(tokenKey); }

// Ensure user is authenticated, else redirect to /login
export function ensureAuth(){
  const t = getToken();
  if (!t) { window.location.href = '/login'; throw new Error('Unauthenticated'); }
  return t;
}

export async function api(path, opts={}){
  const headers = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text();
}

// Auth helpers for quick demo
export async function demoLogin(){
  // ensure demo user exists via seed, then login
  try {
    const { token } = await api('/api/auth/login', { method:'POST', body: JSON.stringify({ email:'demo@example.com', password:'password123' }) });
    setToken(token);
    return true;
  } catch(e){
    alert('Login required. Run seed or sign up.');
    return false;
  }
}
