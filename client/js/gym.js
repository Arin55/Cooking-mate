import { api, ensureAuth } from './api.js';

import Chart from 'chart.js/auto';

async function fetchWorkouts(){
  ensureAuth();
  return api('/api/workouts');
}

function buildChart(id, labels, data, label, color){
  const ctx = document.getElementById(id);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: color+'33', fill: true, tension: .3 }] },
    options: { responsive: true, plugins: { legend: { display: true } } }
  });
}

function lastN(arr, n){ return arr.slice(-n); }

async function render(){
  const list = await fetchWorkouts();
  const last = lastN(list, 7);
  const labels = last.map(w=> new Date(w.date).toLocaleDateString());
  const calories = last.map(w=> w.caloriesBurned);
  const duration = last.map(w=> w.duration);
  buildChart('caloriesChart', labels, calories, 'Calories Burned', '#0ea5e9');
  buildChart('durationChart', labels, duration, 'Duration (min)', '#10b981');
}

async function addDemo(){
  ensureAuth();
  await api('/api/workouts', { method:'POST', body: JSON.stringify({ exercise:'Running', duration: 35, caloriesBurned: 330 })});
  await render();
}

if (document.getElementById('addWorkoutDemo')){
  ensureAuth();
  document.getElementById('addWorkoutDemo').addEventListener('click', addDemo);
  render();
}
