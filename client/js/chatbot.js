import { api } from './api.js';

const bodyEl = document.getElementById('chatBody');
const inputEl = document.getElementById('chatInput');
const sendBtn = document.getElementById('chatSend');

function scrollToBottom(){
  bodyEl.scrollTop = bodyEl.scrollHeight;
}

function pushText(role, text){
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.textContent = text;
  bodyEl.appendChild(div);
  scrollToBottom();
}

function pushHTML(role, html){
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = html;
  bodyEl.appendChild(div);
  scrollToBottom();
}

function typing(start=true){
  let el = document.getElementById('botTyping');
  if (start){
    if (!el){
      el = document.createElement('div');
      el.id = 'botTyping';
      el.className = 'chat-msg bot typing';
      el.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
      bodyEl.appendChild(el);
    }
  } else {
    if (el) el.remove();
  }
  scrollToBottom();
}

function renderRecipeCards(recipes=[]){
  if (!recipes.length) return '';
  const cards = recipes.slice(0, 3).map(r=>{
    const ingList = (r.ingredients||[]).slice(0,4).map(i=>`<li>${i}</li>`).join('');
    const src = r.source ? `<a href="${r.source}" target="_blank" rel="noopener">View Recipe</a>` : '';
    return `
      <div class="recipe-card">
        <img src="${r.image}" alt="${r.title}" />
        <div class="rc-body">
          <div class="rc-title">${r.title}</div>
          <ul class="rc-ings">${ingList}</ul>
          <div class="rc-actions">${src}</div>
        </div>
      </div>`;
  }).join('');
  return `<div class="recipe-list">${cards}</div>`;
}

async function send(){
  const msg = inputEl.value.trim();
  if (!msg) return;
  inputEl.value = '';
  pushText('user', msg);
  typing(true);
  try{
    const res = await api('/api/chatbot', { method:'POST', body: JSON.stringify({ message: msg }) });
    typing(false);
    pushText('bot', res.reply || 'Here you go:');
    if (res.recipes && res.recipes.length){
      pushHTML('bot', renderRecipeCards(res.recipes));
    }
  }catch(e){
    typing(false);
    pushText('bot', 'Sorry, I had trouble fetching that.');
  }
}

if (sendBtn){
  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', (e)=>{ if (e.key==='Enter') send(); });
}
