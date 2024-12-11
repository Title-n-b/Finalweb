// document.addEventListener('DOMContentLoaded', async () => {
//     const exploreProductsContainer = document.getElementById('explore-products');

//     try {
//         // Fetch products from API
//         const response = await fetch('/api/products');
//         if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

//         const products = await response.json();

//         // Render products
//         products.forEach((product) => {
//             const productCard = `
//                <div class="deal-card">
//                     <img src="${product.image_url || 'default-image.jpg'}" alt="${product.model || 'No model'}">
//                     <h3>${product.model || 'Unnamed Product'}</h3>
//                     <div class="price">Price $${product.price ? product.price.toFixed(2) : 'N/A'}</div>
//                     <div class="rating">
//                         <i class="fas fa-star"></i>
//                         <span>4.9</span>
//                     </div>
//                     <button class="btn btn-success add-to-cart">
//                         <i class="fas fa-plus"></i>
//                     </button>
//                 </div>
//             `;
//             exploreProductsContainer.innerHTML += productCard;
//         });
//     } catch (error) {
//         console.error('Error loading products:', error);
//         exploreProductsContainer.innerHTML = '<p>Failed to load products. Please try again later.</p>';
//     }

//     // Initialize dropdown logic (ensure this function is defined)
//     if (typeof initializeDropdowns === 'function') {
//         initializeDropdowns();
//     } else {
//         console.warn('initializeDropdowns function is not defined.');
//     }
// });

document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.getElementById("explore-products");
  
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          productGrid.innerHTML = data
            .map(
              (product) => `
            <div class="deal-card" data-id="${product.model}">
                    <img src="${product.image_url || 'default-image.jpg'}" alt="${product.model || 'No model'}">
                    <h3>${product.model || 'Unnamed Product'}</h3>
                    <div class="price">Price $${product.price ? product.price.toFixed(2) : 'N/A'}</div>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>4.9</span>
                    </div>
                    <button class="btn btn-success add-to-cart">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
          `
            )
            .join("");
  
          // Add click event to each product card
          const productCards = document.querySelectorAll(".deal-card");
          productCards.forEach((card) => {
            card.addEventListener("click", () => {
              const model = card.getAttribute("data-id");
              window.location.href = `product.html?model=${encodeURIComponent(model)}`;
            });
          });
        } else {
          throw new Error("Data is not an array or invalid.");
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        productGrid.innerHTML = `<p>Failed to load products. Error: ${error.message}</p>`;
      });
});

const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const brand = dropdown.querySelector('.brand');
    const option = dropdown.querySelectorAll('.brand li');
    const selected = dropdown.querySelector('.selected');

    select.addEventListener('click', () => {
        select.classList.toggle('select-clicked');
        caret.classList.toggle('caret-rotate');
        brand.classList.toggle('brand-open');
    })
    option.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;
            select.classList.remove('selected-clicked');
            caret.classList.remove('caret-rotate');
            brand.classList.remove('menu-open');
            option.forEach(option => {
                option.classList.remove('active');
            });
            option.classList.add('active');
        });
    });
});