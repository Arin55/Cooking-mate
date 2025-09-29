// Basic API helper
// If site is served from a different port (e.g., 5500), we still want API calls to hit Express on :5000
let DEFAULT_BASE = `${location.origin.replace(/\/$/, '')}`;
if (!/:(5000)$/.test(location.origin)) {
  DEFAULT_BASE = 'http://localhost:5000';
}
export const API_BASE = DEFAULT_BASE;
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
