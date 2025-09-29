import { api, ensureAuth, getToken } from './api.js';

// Elements
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

function estimateCalories(meal){ return Math.floor(200 + Math.random()*400); }
function getIngredientsFromMeal(meal){
  const out=[]; for(let i=1;i<=20;i++){ const ing=meal[`strIngredient${i}`]; const m=meal[`strMeasure${i}`]; if(ing&&ing.trim()) out.push(`${ing}${m?` - ${m}`:''}`); }
  return out; }
function getInstructionsFromMeal(meal){ if(!meal?.strInstructions) return []; return meal.strInstructions.split(/\n+|\.\s+/).map(s=>s.trim()).filter(Boolean); }

async function getUsername(){ try{ if(!getToken()) return 'guest'; const { user } = await api('/api/auth/me'); return user?.username||'guest'; }catch{return 'guest';} }

// API
async function searchMeals(query){
  try{ const data = await api(`/api/recipes/external?q=${encodeURIComponent(query||'')}`); return data.meals||[]; }
  catch{ const r= await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query||'')}`); const d= await r.json(); return d.meals||[]; }
}
async function getMealById(id){
  try{ const data = await api(`/api/recipes/externalById?id=${encodeURIComponent(id)}`); return (data.meals||[])[0]; }
  catch{ const r= await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`); const d= await r.json(); return (d.meals||[])[0]; }
}

// Render
function renderRecipes(meals){
  recipesList.innerHTML=''; if(!meals||meals.length===0){ recipesList.innerHTML='<p>No recipes found.</p>'; return; }
  const fp = (idx)=> idx<3?'high':'auto';
  recipesList.innerHTML = meals.map((meal,idx)=>{
    const cal = estimateCalories(meal);
    const thumb = (meal.strMealThumb||'')+('/preview');
    const titleEsc = meal.strMeal.replace(/"/g,'&quot;');
    return `
      <div class="recipe-card skeleton">
        <img class="lazy-img" width="240" height="160" loading="lazy" decoding="async" fetchpriority="${fp(idx)}" alt="${titleEsc}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-src="${thumb}" data-full="${meal.strMealThumb}" />
        <div class="recipe-card-content">
          <h3>${meal.strMeal}</h3>
          <p>Calories: ${cal} kcal<br>${meal.strArea||''} ${meal.strCategory?`| ${meal.strCategory}`:''}</p>
          <button class="view-btn" data-id="${meal.idMeal}">View Recipe</button>
        </div>
      </div>`;
  }).join('');

  // events
  document.querySelectorAll('.view-btn').forEach(btn=> btn.addEventListener('click', ()=> showRecipeDetails(btn.getAttribute('data-id'))));
  setupLazyImages();

  // best-effort log search if there is an active query in the input
  try {
    const q = (document.getElementById('searchInput')?.value || '').trim();
    if (q) {
      api('/api/recipes/search-log', {
        method: 'POST',
        body: JSON.stringify({ query: q, resultsCount: Array.isArray(meals) ? meals.length : 0 })
      }).catch(()=>{});
    }
  } catch {}
}

function setupLazyImages(){
  const imgs = Array.from(document.querySelectorAll('img.lazy-img[data-src]'));
  if(imgs.length===0) return;
  const load = (img)=>{
    const src = img.getAttribute('data-src'); if(!src) return; const card=img.closest('.recipe-card');
    const tmp = new Image(); tmp.decoding='async';
    tmp.onload=()=>{ img.src=src; img.removeAttribute('data-src'); card?.classList.remove('skeleton'); };
    tmp.onerror=()=>{ const full=img.getAttribute('data-full'); if(full && full!==src){ img.setAttribute('data-src', full); load(img);} else { card?.classList.remove('skeleton'); } };
    tmp.src=src;
  };
  if('IntersectionObserver' in window){ const io=new IntersectionObserver((ents,obs)=>{ ents.forEach(e=>{ if(e.isIntersecting){ load(e.target); obs.unobserve(e.target);} }); }, { rootMargin:'200px 0px'}); imgs.forEach(i=>io.observe(i)); }
  else { imgs.forEach(load); }
}

async function showRecipeDetails(id){
  const meal = await getMealById(id); if(!meal) return;
  // view log (best effort)
  const username = await getUsername(); api('/api/recipes/viewed',{ method:'POST', body: JSON.stringify({ username, recipeId: meal.idMeal, recipeName: meal.strMeal }) }).catch(()=>{});
  modalImg.src = meal.strMealThumb; modalTitle.textContent=meal.strMeal; modalCal.textContent=`Calories: ${estimateCalories(meal)} kcal (est.)`;
  modalIngredients.innerHTML = getIngredientsFromMeal(meal).map(i=>`<li>${i}</li>`).join('');
  modalInstructions.innerHTML = getInstructionsFromMeal(meal).map(s=>`<li>${s}</li>`).join('');
  saveBtn.classList.remove('saved'); saveBtn.disabled=false; saveBtn.textContent='Save Recipe'; saveBtn.onclick=()=>saveRecipe(meal);
  modalBg.classList.add('active'); document.body.style.overflow='hidden';
}
function closeModal(){ modalBg.classList.remove('active'); document.body.style.overflow=''; }
modalClose?.addEventListener('click', closeModal); modalBack?.addEventListener('click', closeModal);
modalBg?.addEventListener('click', (e)=>{ if(e.target===modalBg) closeModal(); });

async function saveRecipe(meal){
  try{ ensureAuth(); const payload={ title:meal.strMeal, image:meal.strMealThumb, ingredients:getIngredientsFromMeal(meal), instructions:getInstructionsFromMeal(meal), calories:estimateCalories(meal), description:`${meal.strArea||''} ${meal.strCategory?`| ${meal.strCategory}`:''}`.trim() };
    const res = await api('/api/recipes/save',{ method:'POST', body: JSON.stringify(payload)}); if(res?.success){ saveBtn.classList.add('saved'); saveBtn.textContent='Saved'; saveBtn.disabled=true; }
  } catch{ alert('Please login to save recipes.'); }
}

function doSearch(){ const q=searchInput.value.trim(); if(!q) return; searchMeals(q).then(renderRecipes); }
searchBtn?.addEventListener('click', doSearch); searchInput?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch(); });

window.addEventListener('load', ()=>{ searchMeals('chicken').then(renderRecipes); });
