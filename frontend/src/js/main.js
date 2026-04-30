/**
 * MAIN.JS
 * Central initialization and module loader
 * Tech Turf - Modern Frontend Architecture
 */

// ========================================
// GLOBAL STATE
// ========================================

window.TechTurf = {
  version: '2.0.0',
  isAuthenticated: false,
  user: null,
  cart: [],
  initialized: false
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize core modules
    await initializeApp();
    
    // Set initialized flag
    window.TechTurf.initialized = true;
    
    console.log('✅ Tech Turf initialized successfully');
  } catch (error) {
    console.error('❌ Initialization error:', error);
  }
});

// ========================================
// APP INITIALIZATION
// ========================================

async function initializeApp() {
  // Load authentication state
  checkAuth();
  
  // Initialize UI components
  initializeNavbar();
  initializeScrollEffects();
  initializeMobileMenu();
  
  // Load page-specific scripts
  loadPageScripts();
}

// ========================================
// AUTHENTICATION CHECK
// ========================================

function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    window.TechTurf.isAuthenticated = true;
    window.TechTurf.user = JSON.parse(user);
    updateUIForAuthenticatedUser();
  }
}

function updateUIForAuthenticatedUser() {
  // Update navbar for logged-in users
  const authButtons = document.querySelectorAll('.auth-required');
  authButtons.forEach(btn => btn.style.display = 'block');
  
  const guestButtons = document.querySelectorAll('.guest-only');
  guestButtons.forEach(btn => btn.style.display = 'none');
}

// ========================================
// NAVBAR
// ========================================

function initializeNavbar() {
  const navbar = document.querySelector('.navbar');
  
  if (!navbar) return;
  
  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Active link highlighting
  highlightActiveNavLink();
}

function highlightActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

// ========================================
// MOBILE MENU
// ========================================

function initializeMobileMenu() {
  const toggle = document.querySelector('.navbar-toggle');
  const menu = document.querySelector('.navbar-nav');
  
  if (!toggle || !menu) return;
  
  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    toggle.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('active');
      toggle.classList.remove('active');
    }
  });
}

// ========================================
// SCROLL EFFECTS
// ========================================

function initializeScrollEffects() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  if (revealElements.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  });
  
  revealElements.forEach(el => observer.observe(el));
}

// ========================================
// PAGE-SPECIFIC SCRIPTS
// ========================================

function loadPageScripts() {
  const path = window.location.pathname;
  
  // Load scripts based on current page
  if (path.includes('products') || path.includes('shopping')) {
    // Products page logic handled by features/products.js
  }
  
  if (path.includes('cart') || path.includes('checkout')) {
    // Cart logic handled by features/cart.js
  }
  
  if (path.includes('dashboard') || path.includes('account')) {
    // Dashboard logic handled by features/account.js
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Show toast notification
window.showToast = function(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '9999';
  toast.style.minWidth = '300px';
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Format currency
window.formatCurrency = function(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Format date
window.formatDate = function(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
