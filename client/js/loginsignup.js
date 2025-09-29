import { api, setToken } from './api.js';

// Toggle password visibility
window.togglePassword = function(id){
  const input = document.getElementById(id);
  const icon = document.getElementById(id + 'Toggle');
  if (!input) return;
  if (input.type === 'password') { input.type = 'text'; if (icon) icon.classList.replace('fa-eye','fa-eye-slash'); }
  else { input.type = 'password'; if (icon) icon.classList.replace('fa-eye-slash','fa-eye'); }
}

// Handle Login
window.handleLogin = async function(){
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errEl = document.getElementById('loginErrorMsg');
  try {
    errEl && (errEl.textContent = '');
    const { token } = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(token);
    document.getElementById('loginContainer').style.display = 'none';
    const success = document.getElementById('successLoginContainer');
    if (success) { success.style.display = 'block'; }
    setTimeout(()=>{ window.location.href = '/client/index.html'; }, 1200);
  } catch (e) {
    errEl && (errEl.textContent = 'Login failed. Check your credentials.');
  }
}

// Handle Signup
window.handleSignup = async function(){
  const username = document.getElementById('signupUsername')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPassword')?.value;
  const errEl = document.getElementById('signupErrorMsg');
  try {
    errEl && (errEl.textContent = '');
    const res = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    // optional: auto-login
    if (res?.token) setToken(res.token);
    document.getElementById('signupContainer').style.display = 'none';
    const success = document.getElementById('successSignupContainer');
    if (success) { success.style.display = 'block'; }
    setTimeout(()=>{ window.location.href = '/client/login.html'; }, 1200);
  } catch (e) {
    errEl && (errEl.textContent = 'Signup failed. Try a different email/username.');
  }
}
