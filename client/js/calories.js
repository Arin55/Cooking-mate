import { api, ensureAuth } from './api.js';

const listEl = document.getElementById('calorieList');

async function fetchCalories(){
  ensureAuth();
  return api('/api/calories');
}

function renderList(items){
  listEl.innerHTML = items.map(i=>`<li style="display:flex;justify-content:space-between;align-items:center;background:#222;border:1px solid #333;padding:10px 12px;border-radius:8px;">
    <span>${i.food}</span><span class='badge'>${i.calories} cal</span>
  </li>`).join('');
}

function renderChart(items){
  const last = items.slice(-7);
  const labels = last.map(i=> new Date(i.date).toLocaleDateString());
  const vals = last.map(i=> i.calories);
  const ctx = document.getElementById('calIntakeChart');
  if (!ctx) return;
  // Chart available globally via chart.umd.js
  new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Calories', data: vals, backgroundColor:'#ff9800' }] }, options:{ plugins:{ legend:{ labels:{ color:'#fff' } } }, scales:{ x:{ ticks:{ color:'#bbb' } }, y:{ ticks:{ color:'#bbb' } } } } });
}

async function add(){
  ensureAuth();
  const food = document.getElementById('food').value.trim();
  const calories = Number(document.getElementById('calories').value);
  if (!food || !calories) return alert('Enter food and calories');
  await api('/api/calories', { method:'POST', body: JSON.stringify({ food, calories })});
  await init();
}

async function init(){
  const items = await fetchCalories();
  renderList(items);
  renderChart(items);
}

if (document.getElementById('addCalBtn')){
  ensureAuth();
  document.getElementById('addCalBtn').addEventListener('click', add);
  init();
}
