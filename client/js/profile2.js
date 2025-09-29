import { api, getToken, logout as apiLogout } from './api.js';

function qs(id){ return document.getElementById(id); }

let user = null;

async function loadUser(){
  const t = getToken();
  if (!t){ location.href = '/login'; return; }
  try{
    const { user: u } = await api('/api/auth/me');
    user = u;
    // Fill UI
    qs('name').textContent = u.name || 'Not set';
    qs('username').textContent = u.username || '';
    qs('email').textContent = u.email || '';
    qs('phone').textContent = u.phone || 'Not set';
    if (u.profilePic) qs('profilePic').src = u.profilePic;
    else ensureAvatar();
  }catch(e){
    location.href = '/login';
  }
}

function ensureAvatar(){
  if (user && !user.profilePic){
    const basis = user.name || user.username || user.email || 'U';
    qs('profilePic').src = generateInitialAvatar(basis);
  }
}

function generateInitialAvatar(text){
  const canvas = document.createElement('canvas');
  const size = 110; canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.fill();
  const initial = (text || '?').trim().charAt(0).toUpperCase();
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 50px Segoe UI'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(initial, size/2, size/2 + 2);
  return canvas.toDataURL('image/png');
}

function showForm(which, show){
  const el = qs(which + 'EditForm');
  el.style.display = show ? 'block' : 'none';
  if (show){
    const valueEl = qs(which);
    const inputEl = qs(which + 'EditInput');
    inputEl.value = (valueEl.textContent === 'Not set') ? '' : valueEl.textContent;
    inputEl.focus();
  }
}

async function saveField(which){
  const inputEl = qs(which + 'EditInput');
  const val = inputEl.value.trim();
  if (!val){ return showMessage('Field cannot be empty!', false); }
  try{
    const body = {}; body[which] = val;
    const { user: u } = await api('/api/auth/me', { method: 'PUT', body: JSON.stringify(body) });
    user = u;
    qs(which).textContent = u[which] || 'Not set';
    showForm(which, false);
    if ((which === 'name' || which === 'username') && !u.profilePic) ensureAvatar();
    showMessage('Profile updated successfully!', true);
  }catch(e){
    showMessage('Update failed: ' + (e.message || 'Server error'), false);
  }
}

function showMessage(msg, ok){
  const m = qs('message');
  m.textContent = msg;
  m.className = ok ? 'success-msg' : 'error-msg';
  setTimeout(()=>{ m.textContent=''; m.className=''; }, 3000);
}

function bindEvents(){
  qs('editName')?.addEventListener('click', ()=> showForm('name', true));
  qs('editUsername')?.addEventListener('click', ()=> showForm('username', true));
  qs('editPhone')?.addEventListener('click', ()=> showForm('phone', true));

  qs('saveName')?.addEventListener('click', ()=> saveField('name'));
  qs('saveUsername')?.addEventListener('click', ()=> saveField('username'));
  qs('savePhone')?.addEventListener('click', ()=> saveField('phone'));

  Array.from(document.querySelectorAll('.edit-form .cancel')).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const which = btn.getAttribute('data-target');
      showForm(which, false);
    });
  });

  qs('toDashboard')?.addEventListener('click', ()=> location.href = '/client/index.html');
  qs('logout')?.addEventListener('click', ()=>{ apiLogout(); location.href = '/client/index.html'; });

  // Picture upload
  qs('picUpload')?.addEventListener('click', ()=> qs('profilePicInput').click());
  qs('profilePicInput')?.addEventListener('change', async (e)=>{
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev)=>{
      try{
        const base64 = ev.target.result;
        const { user: u } = await api('/api/auth/me', { method:'PUT', body: JSON.stringify({ profilePic: base64 }) });
        user = u; qs('profilePic').src = u.profilePic; showMessage('Profile picture updated successfully!', true);
      }catch(err){ showMessage('Failed to update picture', false); }
    };
    reader.readAsDataURL(file);
  });
}

bindEvents();
loadUser();
