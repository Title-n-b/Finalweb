document.addEventListener("DOMContentLoaded", () => {
  const specificProductContainer = document.getElementById("specific-product");
  let quantity = 1;

  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || '2'; // Default to product 2 if no ID provided

  // Fetch and display product
  fetch(`/api/product/${productId}`)
      .then((response) => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then((product) => {
          console.log("Product fetched:", product);
          if (product && typeof product === 'object' && Object.keys(product).length > 0) {
              specificProductContainer.innerHTML = `
                  <div class="card product-card">
                      <div class="row g-0">
                          <div class="col-md-5">
                              <img src="${product.image_url || 'images/default-product.jpg'}" 
                                   class="img-fluid rounded-start" 
                                   alt="${product.model || 'Product Image'}">
                          </div>
                          <div class="col-md-7">
                              <div class="card-body">
                                  <h5 class="card-title">${product.model || 'Unknown Product'}</h5>
                                  <div class="rating">
                                      ${'★'.repeat(Math.floor(product.rating || 0))}${'☆'.repeat(5 - Math.floor(product.rating || 0))}
                                      <span>(${product.reviews || 0}+ Reviews)</span>
                                  </div>
                                  <p class="card-text">${product.description || 'No description available.'}</p>
                                  <div class="price">Price ฿${product.price ? parseFloat(product.price).toFixed(2) : 'N/A'}</div>
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
              throw new Error('Invalid product data received');
          }
      })
      .catch((error) => {
          console.error("Error fetching product:", error);
          specificProductContainer.innerHTML = `
              <div class="alert alert-danger" role="alert">
                  <h4 class="alert-heading">Error Loading Product</h4>
                  <p>We're sorry, but we couldn't load the product information at this time.</p>
                  <hr>
                  <p class="mb-0">Error details: ${error.message}</p>
                  <p>Please try refreshing the page or contact our support team if the problem persists.</p>
              </div>
          `;
      });
});

function addToCart(productId, quantity) {
  if (!productId) {
      console.error("Product ID is missing");
      alert("Error: Product ID is missing");
      return;
  }

  fetch("/api/cart", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          product_id: productId,
          quantity: quantity
      }),
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      if (data.success) {
          alert("Added to cart successfully!");
      } else {
          throw new Error(data.message || "Failed to add to cart");
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert(`Failed to add to cart: ${error.message}. Please try again.`);
  });
}

function saveItem(productId) {
  if (!productId) {
      console.error("Product ID is missing");
      alert("Error: Product ID is missing");
      return;
  }

  fetch("/api/saved", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          product_id: productId
      }),
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      if (data.success) {
          alert("Item saved successfully!");
          const saveButton = document.getElementById("save-item");
          saveButton.classList.add("saved");
          saveButton.disabled = true;
      } else {
          throw new Error(data.message || "Failed to save item");
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert(`Failed to save item: ${error.message}. Please try again.`);
  });
}

function showBuyNowPopup(product, quantity) {
  const popup = document.createElement("div");
  popup.className = "buy-now-popup";
  popup.innerHTML = `
      <div class="popup-content">
          <h2>Complete Your Purchase</h2>
          <form id="buy-now-form">
              <input type="hidden" name="product_id" value="${product.id}">
              <input type="text" name="name" placeholder="Full Name" required>
              <input type="email" name="email" placeholder="Email" required>
              <input type="text" name="address" placeholder="Shipping Address" required>
              <input type="text" name="card" placeholder="Credit Card Number" required>
              <div class="popup-buttons">
                  <button type="submit" class="btn btn-success">Confirm Purchase</button>
                  <button type="button" class="btn btn-outline-secondary" onclick="this.closest('.buy-now-popup').remove()">Cancel</button>
              </div>
          </form>
      </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("buy-now-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const purchaseData = {
          product_id: formData.get("product_id"),
          quantity: quantity,
          name: formData.get("name"),
          email: formData.get("email"),
          address: formData.get("address"),
          card: formData.get("card"),
      };

      fetch("/api/purchase", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(purchaseData),
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          if (data.success) {
              alert("Purchase successful!");
              popup.remove();
              window.location.href = `/purchase?new_purchase_id=${data.purchase.id}`;
          } else {
              throw new Error(data.message || "Failed to complete purchase");
          }
      })
      .catch(error => {
          console.error("Error:", error);
          alert(`Failed to complete purchase: ${error.message}. Please try again.`);
      });
  });
}

