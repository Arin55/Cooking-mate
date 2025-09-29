import { api, ensureAuth } from './api.js';

// Navbar toggle
const menuIcon = document.getElementById('menuToggle');
const navMenu = document.getElementById('navLinks');
menuIcon?.addEventListener('click', (e) => { e.stopPropagation(); navMenu?.classList.toggle('show'); });
document.addEventListener('click', (ev) => { if (navMenu && !navMenu.contains(ev.target) && !menuIcon?.contains(ev.target)) navMenu.classList.remove('show'); });

// Elements
const form = document.getElementById('calorieForm');
const tableBody = document.getElementById('entriesTable');
const totalCaloriesEl = document.getElementById('totalCalories');
const foodInput = document.getElementById('foodName');
const caloriesInput = document.getElementById('calories');
const noteInput = document.getElementById('note');

let entries = [];

function fmt(dtStr){
  try { return new Date(dtStr).toLocaleString(); } catch { return dtStr || ''; }
}

function render(){
  // table
  tableBody.innerHTML = entries.map(e=>{
    const dt = e.date || e.createdAt;
    return `
      <tr>
        <td data-label="Food">${escapeHtml(e.food)}</td>
        <td data-label="Calories">${Number(e.calories)||0}</td>
        <td data-label="Notes">${escapeHtml(e.notes||'')}</td>
        <td data-label="Date/Time">${fmt(dt)}</td>
        <td data-label="Action"><button class="delete-btn" data-id="${e._id}">Delete</button></td>
      </tr>`;
  }).join('');
  // total
  const total = entries.reduce((s,e)=> s + (Number(e.calories)||0), 0);
  totalCaloriesEl.textContent = String(total);
  // bind deletes
  tableBody.querySelectorAll('.delete-btn').forEach(btn=>{
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id) return;
      try {
        ensureAuth();
        await api(`/api/calories/${id}`, { method:'DELETE' });
        entries = entries.filter(x=>x._id !== id);
        render();
      } catch (e) {
        alert('Failed to delete entry');
      }
    });
  });
}

function escapeHtml(str){
  return String(str).replace(/[&<>"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s]));
}

async function load(){
  try{
    ensureAuth();
    const data = await api('/api/calories');
    entries = Array.isArray(data) ? data : [];
    render();
  } catch(e){
    // ensureAuth already redirects
  }
}

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const food = foodInput.value.trim();
  const calories = Number(caloriesInput.value);
  const notes = noteInput.value.trim();
  if (!food || !(calories>0)) return;
  try{
    ensureAuth();
    const payload = { food, calories, notes, date: new Date().toISOString() };
    const created = await api('/api/calories', { method:'POST', body: JSON.stringify(payload) });
    entries = [created, ...entries];
    render();
    form.reset();
  } catch(err){
    alert('Failed to add entry');
  }
});

window.addEventListener('load', load);
