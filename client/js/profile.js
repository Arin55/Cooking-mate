import { api, getToken } from './api.js';

async function loadMe(){
  const token = getToken();
  if (!token) { location.href = '/login'; return; }
  try {
    const { user } = await api('/api/auth/me');
    if (!user) throw new Error('No user');
    const displayName = document.getElementById('displayName');
    const displayEmail = document.getElementById('displayEmail');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    displayName.textContent = user.username;
    displayEmail.textContent = user.email;
    username.value = user.username;
    email.value = user.email;
  } catch (e) {
    console.error(e);
    location.href = '/login';
  }
}

async function save(){
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const ok = document.getElementById('saveOk');
  const err = document.getElementById('saveErr');
  ok.style.display = 'none';
  err.style.display = 'none';
  try {
    const { user } = await api('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ username, email })
    });
    document.getElementById('displayName').textContent = user.username;
    document.getElementById('displayEmail').textContent = user.email;
    ok.style.display = 'block';
  } catch (e) {
    err.textContent = 'Update failed: ' + (e.message || 'Unknown error');
    err.style.display = 'block';
  }
}

// Events
const editBtn = document.getElementById('editBtn');
const backBtn = document.getElementById('backBtn');
const logoutBtn = document.getElementById('logoutBtn');
const saveBtn = document.getElementById('saveBtn');
const editSection = document.getElementById('editSection');

editBtn?.addEventListener('click', ()=>{
  editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
});
backBtn?.addEventListener('click', ()=>{ location.href = '/client/index.html'; });
logoutBtn?.addEventListener('click', ()=>{ localStorage.removeItem('cookfit_token'); location.href = '/client/index.html'; });
saveBtn?.addEventListener('click', save);

loadMe();
