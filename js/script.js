
document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.side-nav a');
    
    // Function to remove active class from all links
    function removeActiveClass() {
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            link.style.backgroundColor = '';
            link.style.color = '';
        });
    }   

    // Add click event listeners to all sidebar links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            removeActiveClass();
            this.classList.add('active');
            this.style.backgroundColor = '#e8f5e9';
            this.style.color = '#4caf50';
        });

        // Hover effects
        link.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e8f5e9';
            this.style.color = '#4caf50';
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'all 0.3s ease';
        });

        link.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = '';
                this.style.color = '';
            }
            this.style.transform = 'translateX(0)';
        });
    });

    // Set active link based on current URL
    function setActiveLink() {
        const currentPath = window.location.pathname;
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || 
                (currentPath === '/' && href === 'index.html') ||
                (currentPath === '/index.html' && href === '/')) {
                link.classList.add('active');
                link.style.backgroundColor = '#e8f5e9';
                link.style.color = '#4caf50';
            }
        });
    }

    // Set active link on page load
    setActiveLink();
});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        const userNav = document.querySelector('.user-nav');
        
        if (response.ok && data.isLoggedIn) {
            // User is logged in - show username and logout button
            userNav.innerHTML = `
                <div class="user-menu">
                    <span class="username">${data.username}</span>
                    <button id="logout-btn" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            `;
            
            // Add logout handler
            document.getElementById('logout-btn').addEventListener('click', async () => {
                try {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.href = '/';
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        } else {
            // User is not logged in - show login link
            userNav.innerHTML = `
                <a href="/login.html">
                    <i class="fas fa-user"></i>
                </a>
            `;
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
});
