document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');
    const mainContent = document.getElementById('main-content');
    const placeholderView = document.getElementById('view-placeholder');

    // Map view names to display titles
    const viewTitles = {
        dashboard: 'Dashboard',
        analytics: 'Analytics & Reports',
        products: 'Products & Inventory',
        orders: 'Orders & Requests',
        services: 'Services & Packages',
        clients: 'Clients & CRM',
        cms: 'Content Management System',
        blog: 'Blog & News',
        projects: 'Projects & Portfolios',
        launches: 'Aerospace Launches & Logs',
        settings: 'System Settings',
        users: 'Team & Roles'
    };

    function switchView(targetView) {
        // 1. Hide all views
        const allViews = document.querySelectorAll('[id^="view-"]');
        allViews.forEach(view => view.classList.add('hidden'));

        // 2. Find specific view
        const specificView = document.getElementById(`view-${targetView}`);

        if (specificView) {
            specificView.classList.remove('hidden');
        } else {
            // 3. Fallback to placeholder
            placeholderView.classList.remove('hidden');

            // Update placeholder text
            const placeholderTitle = placeholderView.querySelector('h3');
            if (placeholderTitle) {
                placeholderTitle.textContent = `${viewTitles[targetView] || 'Module'} Module`;
            }
        }

        // 4. Update Title
        pageTitle.textContent = viewTitles[targetView] || 'Dashboard';

        // 5. Reset Scroll
        mainContent.scrollTop = 0;
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');

            // Update Active State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            switchView(targetView);
        });
    });

    // --- Mock Chart Initialization (Optional) ---
    console.log('Admin Dashboard Initialized');
});