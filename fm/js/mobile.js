document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const mainContent = document.querySelector('.main-content');

    function toggleMenu() {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        document.body.classList.toggle('overflow-hidden');
    }

    mobileMenuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu when clicking on a link
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (sidebar.classList.contains('show')) {
                toggleMenu();
            }
        });
    });

    // Handle resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
                toggleMenu();
            }
        }, 250);
    });

    // Handle swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) < swipeThreshold) return;

        if (swipeDistance > 0 && !sidebar.classList.contains('show')) {
            // Swipe right, open menu
            toggleMenu();
        } else if (swipeDistance < 0 && sidebar.classList.contains('show')) {
            // Swipe left, close menu
            toggleMenu();
        }
    }
});