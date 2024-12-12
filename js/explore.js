document.addEventListener("DOMContentLoaded", () => {
    const specificProductContainer = document.getElementById("specific-product");
    let quantity = 1;

    fetch("/api/product/2")
        .then((response) => response.json())
        .then((product) => {
            if (product) {
                specificProductContainer.innerHTML = `
                    <div class="card product-card mb-4">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src="${product.image_url || 'default-image.jpg'}" 
                                     class="img-fluid rounded-start" 
                                     alt="${product.model}">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${product.model}</h5>
                                    <div class="rating">
                                        ${'★'.repeat(product.rating || 0)}${'☆'.repeat(5 - (product.rating || 0))}
                                        <span>(${product.reviews || 0}+ Reviews)</span>
                                    </div>
                                    <p class="card-text">${product.description || 'No description available.'}</p>
                                    <div class="price">Price $${product.price ? product.price.toFixed(2) : 'N/A'}</div>
                                    <div class="actions">
                                        <button class="btn btn-success" id="add-to-cart">Add to cart</button>
                                        <button class="btn btn-outline-success heart-btn" id="save-item">
                                            <i class="fas fa-heart"></i>
                                        </button>
                                        <div class="quantity">
                                            <button class="btn btn-outline-success" id="decrease-quantity">-</button>
                                            <input type="text" id="quantity-input" value="1" readonly/>
                                            <button class="btn btn-outline-success" id="increase-quantity">+</button>
                                        </div>
                                        <button class="btn btn-success" id="buy-now">Buy Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Add event listeners
                document.getElementById("increase-quantity").addEventListener("click", () => {
                    quantity++;
                    document.getElementById("quantity-input").value = quantity;
                });

                document.getElementById("decrease-quantity").addEventListener("click", () => {
                    if (quantity > 1) {
                        quantity--;
                        document.getElementById("quantity-input").value = quantity;
                    }
                });

                document.getElementById("add-to-cart").addEventListener("click", () => {
                    addToCart(product.id, quantity);
                });

                document.getElementById("save-item").addEventListener("click", () => {
                    saveItem(product.id);
                });

                document.getElementById("buy-now").addEventListener("click", () => {
                    showBuyNowPopup(product, quantity);
                });
            } else {
                specificProductContainer.innerHTML = `<p>No product found.</p>`;
            }
        })
        .catch((error) => {
            console.error("Error fetching product:", error);
            specificProductContainer.innerHTML = `<p>Failed to load product. Error: ${error.message}</p>`;
        });
});

function addToCart(productId, quantity) {
    fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Added to cart successfully!');
        } else {
            alert('Failed to add to cart. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function saveItem(productId) {
    fetch('/api/saved', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Item saved successfully!');
            const saveButton = document.getElementById("save-item");
            saveButton.classList.add('saved');
            saveButton.disabled = true;
            saveButton.textContent = 'Saved';
        } else {
            alert('Failed to save item. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function showBuyNowPopup(product, quantity) {
    const popup = document.createElement('div');
    popup.className = 'buy-now-popup';
    popup.innerHTML = `
        <h2>Complete Your Purchase</h2>
        <form id="buy-now-form">
            <input type="hidden" name="product_id" value="${product.id}">
            <input type="text" name="name" placeholder="Full Name" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="text" name="address" placeholder="Shipping Address" required>
            <input type="text" name="card" placeholder="Credit Card Number" required>
            <button type="submit" class="btn btn-primary">Confirm Purchase</button>
        </form>
    `;
    document.body.appendChild(popup);

    document.getElementById('buy-now-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const purchaseData = {
            product_id: formData.get('product_id'),
            quantity: quantity,
            name: formData.get('name'),
            email: formData.get('email'),
            address: formData.get('address'),
            card: formData.get('card')
        };

        fetch('/api/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Purchase successful!');
                popup.remove();
                // Redirect to the purchase page with the new purchase ID
                window.location.href = `/purchase?new_purchase_id=${data.purchase.id}`;
            } else {
                alert('Purchase failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });
}

// Code for fetching and displaying all products
document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.getElementById("explore-products");
  
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          productGrid.innerHTML = data
            .map(
              (product) => `
            <div class="deal-card" data-id="${product.id}">
                    <img src="${product.image_url || 'default-image.jpg'}" alt="${product.model || 'No model'}">
                    <h3>${product.model || 'Unnamed Product'}</h3>
                    <div class="price">Price $${product.price ? product.price.toFixed(2) : 'N/A'}</div>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>4.9</span>
                    </div>
                    <button class="btn btn-success add-to-cart-btn" data-id="${product.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
          `
            )
            .join("");
  
          // Add click event to each product card
          const productCards = document.querySelectorAll(".deal-card");
          productCards.forEach((card) => {
            card.addEventListener("click", (e) => {
              if (!e.target.classList.contains('add-to-cart-btn')) {
                const productId = card.getAttribute("data-id");
                window.location.href = `product.html?id=${encodeURIComponent(productId)}`;
              }
            });
          });

          // Add click event to "Add to Cart" buttons
          const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
          addToCartButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
              e.stopPropagation();
              const productId = button.getAttribute("data-id");
              addToCart(productId, 1);
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

// Dropdown functionality
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

