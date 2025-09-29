import { api, ensureAuth, getToken } from './api.js';

// DOM refs
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const recipesList = document.getElementById('recipesList');
const modalBg = document.getElementById('modalBg');
const modalClose = document.getElementById('modalClose');
const modalBack = document.getElementById('modalBack');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalCal = document.getElementById('modalCal');
const modalIngredients = document.getElementById('modalIngredients');
const modalInstructions = document.getElementById('modalInstructions');
const saveBtn = document.getElementById('saveBtn');

// Helpers
function estimateCalories(meal){
  return Math.floor(200 + Math.random()*400);
}

function getIngredientsFromMeal(meal){
  const out = [];
  for (let i=1;i<=20;i++){
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) out.push(`${ing}${measure?` - ${measure}`:''}`);
  }
  return out;
}

function getInstructionsFromMeal(meal){
  if (!meal?.strInstructions) return [];
  return meal.strInstructions.split(/\n+|\.\s+/).map(s=>s.trim()).filter(Boolean);
}

async function getUsername(){
  try{
    if (!getToken()) return 'guest';
    const { user } = await api('/api/auth/me');
    return user?.username || 'guest';
  } catch { return 'guest'; }
}

// Fetch from backend proxy to TheMealDB
async function searchMeals(query){
  try {
    const data = await api(`/api/recipes/external?q=${encodeURIComponent(query||'')}`);
    return data.meals || [];
  } catch (e) {
    // Fallback to direct MealDB (public key=1)
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query||'')}`);
    const data = await res.json();
    return data.meals || [];
  }
}

async function getMealById(id){
  try {
    const data = await api(`/api/recipes/externalById?id=${encodeURIComponent(id)}`);
    return (data.meals||[])[0];
  } catch (e) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`);
    const data = await res.json();
    return (data.meals||[])[0];
  }
}

// Render cards
function renderRecipes(meals){
  if (!meals || meals.length===0){
    return;
  }
  const fp = (idx) => idx < 3 ? 'high' : 'auto';
  recipesList.innerHTML = meals.map((meal, idx)=>{
    const cal = estimateCalories(meal);
    const thumb = (meal.strMealThumb || '').endsWith('/preview') ? meal.strMealThumb : `${meal.strMealThumb}/preview`;
    return `
      <div class="recipe-card skeleton">
        <img
          class="lazy-img"
          alt="${meal.strMeal.replace(/\"/g,'&quot;')}"
          width="240" height="160"
          loading="lazy"
          decoding="async"
          fetchpriority="${fp(idx)}"
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          data-src="${thumb}"
        <div class="recipe-card-content">
          <h3>${meal.strMeal}</h3>
          <p>Calories: ${cal} kcal<br>${meal.strArea||''} ${meal.strCategory?`| ${meal.strCategory}`:''}</p>
          <button class="view-btn" data-id="${meal.idMeal}">View Recipe</button>
        </div>
      </div>`;
  }).join('');

  // attach events
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => showRecipeDetails(btn.getAttribute('data-id')));
  });
}

function setupLazyImages(){
  const imgs = Array.from(document.querySelectorAll('img.lazy-img[data-src]'));
  if (imgs.length === 0) return;
  const loadImg = (img) => {
    const src = img.getAttribute('data-src');
    if (!src) return;
    const card = img.closest('.recipe-card');
    const tmp = new Image();
    tmp.decoding = 'async';
    tmp.onload = () => {
      img.src = src;
      img.removeAttribute('data-src');
      card?.classList.remove('skeleton');
    };
    tmp.onerror = () => {
      const full = img.getAttribute('data-full');
      if (full && full !== src) {
        img.setAttribute('data-src', full);
        loadImg(img);
      } else {
        card?.classList.remove('skeleton');
      }
    };
    tmp.src = src;
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          loadImg(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: '200px 0px' });
    imgs.forEach(img => io.observe(img));
  } else {
    imgs.forEach(loadImg);
  }
}
  modalBg.classList.add('active');
  document.body.style.overflow = 'hidden';
modalBg?.addEventListener('click', (e)=>{ if (e.target === modalBg) closeModal(); });
function closeModal(){ modalBg.classList.remove('active'); document.body.style.overflow=''; }

// Save external recipe to our DB
async function saveRecipe(meal){
  try{
    ensureAuth();
    const payload = {
      title: meal.strMeal,
      image: meal.strMealThumb,
      ingredients: getIngredientsFromMeal(meal),
      instructions: getInstructionsFromMeal(meal),
      calories: estimateCalories(meal),
      description: `${meal.strArea||''} ${meal.strCategory?`| ${meal.strCategory}`:''}`.trim(),
    };
    const res = await api('/api/recipes/save', { method:'POST', body: JSON.stringify(payload) });
    if (res?.success){
      saveBtn.classList.add('saved');
      saveBtn.textContent = 'Saved';
      saveBtn.disabled = true;
    }
  } catch(e){
    alert('Please login to save recipes.');
  }
}

// Search interactions
function doSearch(){
  const q = searchInput.value.trim();
  if (!q) return;
  searchMeals(q).then(renderRecipes);
}

searchBtn?.addEventListener('click', doSearch);
searchInput?.addEventListener('keydown', (e)=>{ if (e.key==='Enter') doSearch(); });

// Initial load
window.addEventListener('load', ()=>{
  // default search
  searchMeals('chicken').then(renderRecipes);
});

