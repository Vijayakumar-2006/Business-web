// Basic client-side view router + mobile menu and toasts

// cache DOM
const views = Array.from(document.querySelectorAll('.view'));
const navButtons = Array.from(document.querySelectorAll('button[data-view]'));
const toastWrap = (() => {
  const el = document.createElement('div');
  el.className = 'toast-wrap';
  document.body.appendChild(el);
  return el;
})();

// show initial view
function showView(id){
  // toggle active state on nav buttons
  navButtons.forEach(btn => {
    if(btn.dataset.view === id) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  let viewFound = false;
  views.forEach(v => {
    if(v.id === id){
      v.classList.remove('hidden');
      v.classList.add('fade-up');
      // small reflow to replay animation
      void v.offsetWidth;
      viewFound = true;
      // Scroll to top of the page when switching views
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      v.classList.add('hidden');
    }
  });

  // If view not found, show home as fallback
  if(!viewFound && id !== 'home'){
    showView('home');
    return;
  }

  // close any active mobile icon states (icons re-rendered by lucide)
  try { lucide.createIcons(); } catch(e){}
}



// scroll to footer
function scrollToFooter(){
  // First, show the home view to ensure footer is visible
  showView('home');
  // Wait a moment for view to render, then scroll
  setTimeout(() => {
    const footer = document.getElementById('footer');
    if(footer){
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);

  // update active nav button
  navButtons.forEach(btn => {
    if(btn.dataset.view === 'contact') btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

// toast helper
function showToast(message, timeout = 3000){
  const t = document.createElement('div');
  t.className = 'toast fade-up';
  t.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="opacity:.95">
    <path d="M9 12l2 2 4-4" stroke="#34D399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#34D399" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.14"/>
  </svg><div style="flex:1">${message}</div>`;
  toastWrap.appendChild(t);
  setTimeout(()=> {
    t.style.opacity = '0';
    t.style.transform = 'translateY(-8px)';
    setTimeout(()=> t.remove(), 300);
  }, timeout);
}

// basic form handlers (demo)
document.addEventListener('submit', function(e){
  const form = e.target;
  // Only handle demo forms explicitly marked with the "demo-form" class.
  // This prevents interfering with real signup/login handlers on the site.
  if (!form || !form.classList || !form.classList.contains('demo-form')) return;

  e.preventDefault();
  showToast('Thanks — form submitted (demo).');
  // reset demo
  form.reset();
  // navigate to home after sign up/login simulation
  const btn = form.querySelector('button');
  if(btn && btn.textContent.toLowerCase().includes('sign')) showView('login');
});

// Check login state and update navigation
function updateNavigation() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const guestItems = document.querySelectorAll('.nav-guest');
  const userItems = document.querySelectorAll('.nav-user');
  
  if (isLoggedIn) {
    // Hide guest items (Login, Sign Up, Terms)
    guestItems.forEach(item => item.style.display = 'none');
    // Show user items (Profile)
    userItems.forEach(item => item.style.display = 'flex');
  } else {
    // Show guest items
    guestItems.forEach(item => item.style.display = '');
    // Hide user items
    userItems.forEach(item => item.style.display = 'none');
  }
  
  // Re-render icons
  try { lucide.createIcons(); } catch(e) {}
}

// Handle logout (global function)
window.handleLogout = function() {
  if (confirm('Are you sure you want to logout?')) {
    // Only remove login state, keep userData so user can log back in
    localStorage.removeItem('isLoggedIn');
    updateNavigation();
    showView('home');
    showToast('You have been logged out successfully.');
    // Clear hash
    window.location.hash = '';
  }
}

// Check if redirecting to dashboard or profile
function checkDashboardRedirect() {
  const hash = window.location.hash;
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (hash === '#dashboard' && isLoggedIn) {
    window.location.href = 'dashboard.html';
  } else if (hash === '#dashboard' && !isLoggedIn) {
    // Redirect to login if not logged in
    window.location.href = 'login.html';
  } else if (hash === '#profile' && isLoggedIn) {
    window.location.href = 'profile.html';
  } else if (hash === '#profile' && !isLoggedIn) {
    window.location.href = 'login.html';
  } else if (hash === '#terms') {
    // Show terms view
    showView('terms');
  } else if (hash === '#contact') {
    // Show contact view
    showView('contact');
  } else {
    // initial setup: show home
    showView('home');
  }
}

// Update navigation on load
updateNavigation();

// Check for dashboard redirect
checkDashboardRedirect();

// Listen for hash changes
window.addEventListener('hashchange', checkDashboardRedirect);

// ensure lucide icons present
try { lucide.createIcons(); } catch (e) {}
