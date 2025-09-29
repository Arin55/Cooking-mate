import { api, ensureAuth } from './api.js';

// Navbar toggle
const menuIcon = document.getElementById('menuToggle');
const navMenu = document.getElementById('navLinks');
menuIcon?.addEventListener('click', (e) => { e.stopPropagation(); navMenu?.classList.toggle('show'); });
document.addEventListener('click', (e) => { if (navMenu && !navMenu.contains(e.target) && !menuIcon?.contains(e.target)) navMenu.classList.remove('show'); });

// Elements
const workoutForm = document.getElementById('workoutForm');
const exerciseEl = document.getElementById('exercise');
const durationEl = document.getElementById('duration');
const caloriesBurnedEl = document.getElementById('caloriesBurned');
const exerciseTypeEl = document.getElementById('exerciseType');
const setsEl = document.getElementById('sets');
const repsEl = document.getElementById('reps');
const weightEl = document.getElementById('weight');
const distanceEl = document.getElementById('distance');
const notesEl = document.getElementById('notes');
const dateFilterEl = document.getElementById('dateFilter');
const workoutTableWrap = document.getElementById('workoutTable');

const dietFoodEl = document.getElementById('dietFood');
const dietCaloriesEl = document.getElementById('dietCalories');
const addDietBtn = document.getElementById('addDietBtn');
const dietTableTbody = document.querySelector('#dietTable tbody');

let workouts = [];
let diets = [];

function fmt(dt){ try { return new Date(dt).toLocaleString(); } catch { return dt || ''; } }
function esc(s){ return String(s??'').replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

function updateStats(){
  const w = workouts || [];
  const totalW = w.length;
  const totalMin = w.reduce((s,e)=> s + (Number(e.duration)||0), 0);
  const totalCal = w.reduce((s,e)=> s + (Number(e.caloriesBurned)||0), 0);
  const set = (id, val)=>{ const el=document.getElementById(id); if (el) el.textContent = String(val); };
  set('statWorkouts', totalW);
  set('statMinutes', totalMin);
  set('statBurned', totalCal);
}

function renderWorkouts(){
  const rows = (workouts||[]).filter(w => {
    if (!dateFilterEl?.value) return true;
    const d = new Date(w.date || w.createdAt);
    const f = new Date(dateFilterEl.value);
    return d.toDateString() === f.toDateString();
  }).map(w => `
    <tr>
      <td data-label="Date">${fmt(w.date || w.createdAt)}</td>
      <td data-label="Exercise">${esc(w.exercise)}</td>
      <td data-label="Duration">${Number(w.duration)||0} min</td>
      <td data-label="Calories">${Number(w.caloriesBurned)||0}</td>
      <td data-label="Type">${esc(w.type||'-')}</td>
      <td data-label="Sets">${w.sets ?? '-'}</td>
      <td data-label="Reps">${w.reps ?? '-'}</td>
      <td data-label="Weight">${w.weight ?? '-'}</td>
      <td data-label="Distance">${w.distance ?? '-'}</td>
      <td data-label="Notes">${esc(w.notes||'')}</td>
      <td data-label="Action"><button class="delete btn delete" data-id="${w._id}">Delete</button></td>
    </tr>`).join('');

  workoutTableWrap.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Exercise</th><th>Duration</th><th>Calories</th><th>Type</th><th>Sets</th><th>Reps</th><th>Weight</th><th>Distance</th><th>Notes</th><th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  workoutTableWrap.querySelectorAll('button.delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id) return;
      try {
        ensureAuth();
        await api(`/api/workouts/${id}`, { method:'DELETE' });
        workouts = workouts.filter(w=>w._id!==id);
        renderWorkouts();
        updateStats();
      } catch { alert('Failed to delete workout'); }
    });
  });
}

function renderDiets(){
  dietTableTbody.innerHTML = (diets||[]).map(d => `
    <tr>
      <td data-label="Date">${fmt(d.date || d.createdAt)}</td>
      <td data-label="Food">${esc(d.food)}</td>
      <td data-label="Calories">${Number(d.calories)||0}</td>
      <td data-label="Actions"><button class="delete btn delete" data-id="${d._id}">Delete</button></td>
    </tr>`).join('');

  dietTableTbody.querySelectorAll('button.delete').forEach(btn => {
    btn.addEventListener('click', async ()=>{
      const id = btn.getAttribute('data-id');
      if (!id) return;
      try {
        ensureAuth();
        await api(`/api/diets/${id}`, { method:'DELETE' });
        diets = diets.filter(x=>x._id!==id);
        renderDiets();
      } catch { alert('Failed to delete diet'); }
    });
  });
}

async function loadAll(){
  try{
    ensureAuth();
    const [w, d] = await Promise.all([
      api('/api/workouts'),
      api('/api/diets')
    ]);
    workouts = Array.isArray(w)? w : [];
    diets = Array.isArray(d)? d : [];
    renderWorkouts();
    renderDiets();
    updateStats();
  } catch (e){ /* ensureAuth redirects if needed */ }
}

workoutForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    exercise: exerciseEl.value.trim(),
    duration: Number(durationEl.value),
    caloriesBurned: Number(caloriesBurnedEl.value)||0,
    type: exerciseTypeEl.value || undefined,
    sets: setsEl.value? Number(setsEl.value): undefined,
    reps: repsEl.value? Number(repsEl.value): undefined,
    weight: weightEl.value? Number(weightEl.value): undefined,
    distance: distanceEl.value? Number(distanceEl.value): undefined,
    notes: notesEl.value.trim()|| undefined,
    date: new Date().toISOString(),
  };
  if (!payload.exercise || !(payload.duration>0)) return;
  try{
    ensureAuth();
    const created = await api('/api/workouts', { method:'POST', body: JSON.stringify(payload) });
    workouts = [created, ...workouts];
    renderWorkouts();
    updateStats();
    workoutForm.reset();
  } catch { alert('Failed to add workout'); }
});

dateFilterEl?.addEventListener('change', renderWorkouts);
addDietBtn?.addEventListener('click', async ()=>{
  const food = dietFoodEl.value.trim();
  const calories = Number(dietCaloriesEl.value);
  if (!food || !(calories>0)) return;
  try{
    ensureAuth();
    const created = await api('/api/diets', { method:'POST', body: JSON.stringify({ food, calories, date: new Date().toISOString() }) });
    diets = [created, ...diets];
    renderDiets();
    dietFoodEl.value='';
    dietCaloriesEl.value='';
  } catch { alert('Failed to add diet'); }
});

window.addEventListener('load', loadAll);
