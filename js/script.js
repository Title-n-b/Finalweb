// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Toggle mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const sideNav = document.querySelector('.side-nav');

    if (menuToggle && sideNav) {
        menuToggle.addEventListener('click', () => {
            sideNav.classList.toggle('active');
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Implement search functionality
            console.log('Searching for:', e.target.value);
        });
    }

    // Initialize cart
    initializeCart();
});

// Cart functionality
function initializeCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add to cart function
    window.addToCart = function(product) {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    };

    // Update cart count
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }

    // Initial cart count update
    updateCartCount();
}

// Product data
const products = [
    {
        id: 1,
        name: "Beats kaeHoney",
        price: 450.55,
        description: "Ergonomic or cups with on-oor controls up to 22 hours of tening time. Apple W1 crip & Closs",
        image: "images/product1.jpg",
        rating: 5,
        reviews: 200
    },
    // Add more products here
];

// Function to create product card
function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="rating">
                    ${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)}
                    <span>(${product.reviews}+ Reviews)</span>
                </div>
                <p>${product.description}</p>
                <div class="price">Price $ ${product.price}</div>
                <div class="product-actions">
                    <button onclick="addToCart(${product.id})" class="add-to-cart">Add to card</button>
                    <button class="buy-now">Buy Now</button>
                </div>
            </div>
        </div>
    `;
}
document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.side-nav a');

    sidebarLinks.forEach(link => {
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

    // Function to set active link
    function setActiveLink() {
        const currentPath = window.location.pathname;
        sidebarLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
                link.style.backgroundColor = '#e8f5e9';
                link.style.color = '#4caf50';
            } else {
                link.classList.remove('active');
                link.style.backgroundColor = '';
                link.style.color = '';
            }
        });
    }

    // Set active link on page load
    setActiveLink();

    // Optional: Update active link on navigation if using AJAX
    // You would need to call setActiveLink() after each navigation event
});

