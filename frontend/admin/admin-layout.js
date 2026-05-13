// Admin Layout Logic
const isFile = window.location.protocol === 'file:';
const API_BASE_URL = isFile ? 'http://localhost:5000/api' : 'http://localhost:5000/api';

// --- Toast Notification System (Made global for module scripts) ---
window.showToast = function (message, type = 'info') {
    const toast = document.createElement('div');
    const typeClasses = {
        'success': 'border-green-500/50',
        'error': 'border-red-500/50',
        'info': 'border-blue-500/50'
    };
    const borderClass = typeClasses[type] || typeClasses['info'];

    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-2xl iphone-glass shadow-2xl text-white border ${borderClass} transition-all duration-300 opacity-0 z-50 translate-y-4`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(4px)';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

window.showMessage = window.showToast;
window.getAuthToken = function () {
    return localStorage.getItem('tt_token') || localStorage.getItem('token');
};

// Make API_BASE_URL global
window.API_BASE_URL = API_BASE_URL;

function parseJwtPayload(jwtToken) {
    if (!jwtToken || jwtToken.split('.').length < 2) return null;
    try {
        const payload = jwtToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function isPrivilegedAdminRole(role) {
    return ['admin', 'superadmin'].includes(role);
}

function ensureSEO() {
    if (typeof window.applySEO === 'function') {
        window.applySEO();
        return;
    }

    if (!document.querySelector('script[data-seo="true"]')) {
        const script = document.createElement('script');
        script.src = '/src/js/features/seo.js';
        script.defer = true;
        script.dataset.seo = 'true';
        script.onload = () => {
            if (typeof window.applySEO === 'function') {
                window.applySEO();
            }
        };
        document.head.appendChild(script);
    }
}

// --- Auth Check ---
async function checkAuth() {
    const token = localStorage.getItem('tt_admin_token') || localStorage.getItem('tt_token');
    if (!token) {
        console.log('[AUTH CHECK] No token found in localStorage');
        console.log('[AUTH CHECK] localStorage keys:', Object.keys(localStorage));
        window.location.href = '/admin/admin-login.html';
        return null;
    }

    const tokenPayload = parseJwtPayload(token);
    const hasAdminRole = isPrivilegedAdminRole(tokenPayload?.role) || tokenPayload?.isAdmin === true;
    if (!hasAdminRole) {
        console.log('[AUTH CHECK] Token is not an admin token.');
        window.location.href = '/admin/admin-login.html';
        return null;
    }

    // Verify token with backend
    const verified = await verifyTokenWithBackend(token);
    if (!verified) {
        console.log('[AUTH CHECK] Server verification failed');
        window.location.href = '/admin/admin-login.html';
        return null;
    }

    console.log('[AUTH CHECK] Token verified and authorized');
    return token;
}

// Helper to verify token with backend
async function verifyTokenWithBackend(token) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.valid === true;
    } catch (err) {
        console.error('Error verifying token:', err);
        return false;
    }
}

// --- Sidebar Generation ---
function renderSidebar() {
    const sidebar = document.getElementById('sidebar-container');
    if (!sidebar) return;

    const menuItems = [
        { name: 'Master Admin', icon: 'layout-grid', href: 'master-admin.html' },
        { name: 'Dashboard', icon: 'layout-dashboard', href: 'dashboard.html' },
        { name: 'Advanced Analytics', icon: 'bar-chart-3', href: 'advanced-analytics.html' },
        { name: 'Ops Center', icon: 'server-cog', href: 'ops-center.html' },
        { name: 'Products', icon: 'package', href: 'products.html' },
        { name: 'Enhanced Products', icon: 'package-2', href: 'enhanced-products.html' },
        { name: 'Orders', icon: 'shopping-cart', href: 'orders.html' },
        { name: 'Branch Management', icon: 'building-2', href: 'branches.html' },
        { name: 'Users', icon: 'users', href: 'users.html' },
        { name: 'User Groups', icon: 'users-2', href: 'user-groups.html' },
        { name: 'Reports', icon: 'file-text', href: 'reports.html' },
        { name: 'Launches', icon: 'rocket', href: 'launches.html' },
        { name: 'Content', icon: 'file-text', href: 'content.html' },
        { name: 'Media Library', icon: 'image', href: 'media.html' },
        { name: 'Support', icon: 'life-buoy', href: 'support.html' },
        { name: 'System Settings', icon: 'settings', href: 'system-settings.html' },
        { name: 'Business CRM', icon: 'briefcase', href: '#', isCRM: true },
    ];

    const currentPath = window.location.pathname.split('/').pop();

    sidebar.innerHTML = `
        <div class="p-8">
            <h1 class="text-2xl font-black text-white flex items-center tracking-tighter">
                <i data-lucide="zap" class="w-6 h-6 mr-3 text-white"></i> TECH<span class="text-white/50">TURF</span>
            </h1>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            ${menuItems.map(item => {
                if (item.isCRM) {
                    return `<button onclick="openCRMFromSidebar()" class="w-full flex items-center px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                        <i data-lucide="${item.icon}" class="w-5 h-5 mr-3 transition-colors group-hover:text-white"></i>
                        <span class="font-bold text-sm tracking-wide text-inherit">${item.name}</span>
                    </button>`;
                } else {
                    return `<a href="${item.href}" class="flex items-center px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group ${currentPath === item.href ? 'iphone-glass text-white' : ''}">
                        <i data-lucide="${item.icon}" class="w-5 h-5 mr-3 transition-colors ${currentPath === item.href ? 'text-white' : 'group-hover:text-white'}"></i>
                        <span class="font-bold text-sm tracking-wide text-inherit">${item.name}</span>
                    </a>`;
                }
            }).join('')}
        </nav>
        <div class="p-6 border-t border-white/5">
            <button id="logout-button" class="w-full flex items-center justify-center iphone-glass text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all border border-white/5">
                <i data-lucide="log-out" class="w-4 h-4 mr-2"></i> Log Out
            </button>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('tt_admin_token');
        localStorage.removeItem('tt_token');
        window.location.href = '/admin/admin-login.html';
    });
}

// --- Topbar Generation ---
function renderTopbar() {
    const topbar = document.getElementById('topbar-container');
    // Apply premium gradient background to topbar container
if (!topbar) return;

topbar.classList.add('bg-gradient-to-r','from-indigo-600','via-purple-600','to-pink-600','p-4','rounded-xl','iphone-glass','transition-all','duration-300');

    const currentPath = window.location.pathname.split('/').pop();
    let title = 'Admin Dashboard';
    if (currentPath === 'master-admin.html') title = 'Master Admin Panel';
    else if (currentPath === 'ops-center.html') title = 'Unified Operations Center';
    else if (currentPath === 'advanced-analytics.html') title = 'Advanced Analytics Dashboard';
    if (currentPath === 'products.html') title = 'Products & Inventory';
    else if (currentPath === 'enhanced-products.html') title = 'Enhanced Products Management';
    else if (currentPath === 'orders.html') title = 'Orders & Requests';
    else if (currentPath === 'branches.html') title = 'Branch Management';
    else if (currentPath === 'users.html') title = 'Team & Roles';
    else if (currentPath === 'user-groups.html') title = 'User Groups & Permissions';
    else if (currentPath === 'reports.html') title = 'Reports & Analytics';
    else if (currentPath === 'launches.html') title = 'Aerospace Launches & Logs';
    else if (currentPath === 'content.html') title = 'Content Management System';
    else if (currentPath === 'media.html') title = 'Media Library';
    else if (currentPath === 'support.html') title = 'Support Tickets';
    else if (currentPath === 'system-settings.html') title = 'System Settings';

    topbar.innerHTML = `
        <h2 class="text-xl font-black text-white tracking-tight" id="page-title">${title}</h2>
        <div class="flex items-center space-x-6">
            <button class="relative text-gray-400 hover:text-white transition-colors" id="dark-mode-toggle">
                <i data-lucide="moon" class="w-6 h-6"></i>
            </button>
            <button class="relative text-gray-400 hover:text-white transition-colors" id="notification-button">
                <i data-lucide="bell" class="w-6 h-6"></i>
                <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div class="relative">
                <button id="avatar-btn" class="w-10 h-10 rounded-xl iphone-glass border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                    AD
                </button>
                <div id="avatar-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-10">
                    <a href="/admin/profile.html" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</a>
                    <button id="avatar-logout-button" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Log Out</button>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

// Dark mode toggle logic
const dmToggle = document.getElementById('dark-mode-toggle');
if (dmToggle) {
    dmToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        const icon = dmToggle.querySelector('i');
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (window.lucide) lucide.createIcons();
    });
}

// Avatar menu logic
const avatarBtn = document.getElementById('avatar-btn');
const avatarMenu = document.getElementById('avatar-menu');
if (avatarBtn && avatarMenu) {
    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
        avatarMenu.classList.add('hidden');
    });
    // Logout from avatar menu
    const avatarLogout = document.getElementById('avatar-logout-button');
    if (avatarLogout) {
        avatarLogout.addEventListener('click', () => {
            localStorage.removeItem('tt_admin_token');
            localStorage.removeItem('tt_token');
            window.location.href = '/admin/admin-login.html';
        });
    }
}

}

// --- Core Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    const token = await checkAuth();
    if (token) {
        renderSidebar();
        renderTopbar();
    }

    ensureSEO();
});