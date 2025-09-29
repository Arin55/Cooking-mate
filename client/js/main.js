import { API_BASE, getToken } from './api.js';

// Chatbox toggle
const toggle = document.getElementById('chatToggle');
const box = document.getElementById('chatBox');
if (toggle && box){
  toggle.addEventListener('click', ()=>{
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
  });
}

// Highlight active nav link
[...document.querySelectorAll('.nav-link')].forEach(a=>{
  const href = a.getAttribute('href') || '';
  if (href && location.pathname.endsWith(href)) a.classList.add('active');
});

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      // Update aria-label for accessibility
      const isOpen = navLinks.classList.contains('show');
      menuToggle.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Open Menu');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('show');
        menuToggle.setAttribute('aria-label', 'Open Menu');
      }
    });
    
    // Close menu when clicking on a link
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('show');
        menuToggle.setAttribute('aria-label', 'Open Menu');
      }
    });
  }
});

// Dynamic navbar items for custom dark navbar (index/profile)
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('navLinks');
  if (!menu) return;
  const token = getToken();
  // Clear trailing auth links then rebuild consistent set
  const baseLinks = [
    { href: '/client/index.html', text: 'Home' },
    { href: '/client/recipes.html', text: 'Recipes' },
    { href: '/client/calories.html', text: 'Calorie Tracker' },
    { href: '/client/gym.html', text: 'Gym Tracker' },
  ];
  menu.innerHTML = baseLinks.map(l=>`<a href="${l.href}">${l.text}</a>`).join('');
  if (token) {
    menu.insertAdjacentHTML('beforeend', `<a href="/profile">Profile</a>`);
  } else {
    menu.insertAdjacentHTML('beforeend', `<a href="/login">Login</a>`);
  }
});
