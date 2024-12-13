// Main JavaScript functionality
// document.addEventListener('DOMContentLoaded', function() {
//     // Toggle mobile menu
//     const menuToggle = document.querySelector('.menu-toggle');
//     const sideNav = document.querySelector('.side-nav');

//     if (menuToggle && sideNav) {
//         menuToggle.addEventListener('click', () => {
//             sideNav.classList.toggle('active');
//         });
//     }

//     // Search functionality
//     const searchInput = document.querySelector('.search-bar input');
//     if (searchInput) {
//         searchInput.addEventListener('input', (e) => {
//             // Implement search functionality
//             console.log('Searching for:', e.target.value);
//         });
//     }

//     // Initialize cart
//     initializeCart();
// });

// //
// document.addEventListener("DOMContentLoaded", () => {
//     const searchInput = document.getElementById("search-input");
//     const productGrid = document.getElementById("explore-products");

//     let products = []; // เก็บข้อมูลสินค้า

//     // ดึงข้อมูลสินค้าเมื่อหน้าโหลด
//     fetch("/api/products")
//         .then((response) => response.json())
//         .then((data) => {
//             products = data; // เก็บสินค้าในตัวแปร
//             displayProducts(products); // แสดงสินค้าทั้งหมด
//         })
//         .catch((error) => {
//             console.error("Error fetching products:", error);
//         });

//     // ฟังก์ชันสำหรับแสดงสินค้า
//     function displayProducts(productsToDisplay) {
//         productGrid.innerHTML = productsToDisplay
//             .map(
//                 (product) => `
//             <div class="deal-card">
//                 <img src="${product.image_url || 'default-image.jpg'}" alt="${product.model || 'No model'}">
//                 <h3>${product.model || 'Unnamed Product'}</h3>
//                 <div class="price">Price $${product.price ? product.price.toFixed(2) : 'N/A'}</div>
//                 <div class="rating">
//                     <i class="fas fa-star"></i>
//                     <span>4.9</span>
//                 </div>
//                 <button class="btn btn-success add-to-cart">
//                     <i class="fas fa-plus"></i>
//                 </button>
//             </div>
//           `
//             )
//             .join("");
//     }

//     // ฟังก์ชันค้นหาสินค้า
//     searchInput.addEventListener("input", (e) => {
//         const searchTerm = e.target.value.toLowerCase();

//         // กรองสินค้าที่ตรงกับคำค้นหา
//         const filteredProducts = products.filter((product) =>
//             product.model.toLowerCase().includes(searchTerm)
//         );

//         // แสดงสินค้าที่กรองแล้ว
//         displayProducts(filteredProducts);
//     });
// });


// //

// // Cart functionality
// function initializeCart() {
//     let cart = JSON.parse(localStorage.getItem('cart')) || [];

//     // Add to cart function
//     window.addToCart = function(product) {
//         cart.push(product);
//         localStorage.setItem('cart', JSON.stringify(cart));
//         updateCartCount();
//     };

//     // Update cart count
//     function updateCartCount() {
//         const cartCount = document.querySelector('.cart-count');
//         if (cartCount) {
//             cartCount.textContent = cart.length;
//         }
//     }

//     // Initial cart count update
//     updateCartCount();
// }

// // Product data
// const products = [
//     {
//         id: 1,
//         name: "Beats kaeHoney",
//         price: 450.55,
//         description: "Ergonomic or cups with on-oor controls up to 22 hours of tening time. Apple W1 crip & Closs",
//         image: "images/product1.jpg",
//         rating: 5,
//         reviews: 200
//     },
//     // Add more products here
// ];

// // Function to create product card
// function createProductCard(product) {
//     return `
//         <div class="product-card">
//             <img src="${product.image}" alt="${product.name}">
//             <div class="product-info">
//                 <h3>${product.name}</h3>
//                 <div class="rating">
//                     ${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)}
//                     <span>(${product.reviews}+ Reviews)</span>
//                 </div>
//                 <p>${product.description}</p>
//                 <div class="price">Price $ ${product.price}</div>
//                 <div class="product-actions">
//                     <button onclick="addToCart(${product.id})" class="add-to-cart">Add to card</button>
//                     <button class="buy-now">Buy Now</button>
//                 </div>
//             </div>
//         </div>
//     `;
// }
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
