document.addEventListener("DOMContentLoaded", () => {
    const productDetails = document.getElementById("product-details");
    const params = new URLSearchParams(window.location.search);
    const model = params.get("model");
  
    if (model) {
      fetch(`/api/products`)
        .then((response) => response.json())
        .then((data) => {
          const product = data.find((item) => item.model === model);
          if (product) {
            productDetails.innerHTML = `
            <div class="detail-product">
                <img src="${product.image_url}" alt="${product.model}">
                <h1>${product.model}</h1>
                <p class="description">This is a premium ${product.model} product, carefully crafted for your satisfaction.</p>
                <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                <p class="brand">Brand: ${product.brand_name}</p>
                <p class="category">Category: ${product.category_name}</p>
            </div>
            `;
          } else {
            productDetails.innerHTML = `<p>Product not found.</p>`;
          }
        })
        .catch((error) => {
          console.error("Error loading product:", error);
          productDetails.innerHTML = `<p>Error loading product details.</p>`;
        });
    } else {
      productDetails.innerHTML = `<p>Invalid product.</p>`;
    }
  
    // Add buy now button functionality
    const buyNowButton = document.getElementById("buy-now");
    buyNowButton.addEventListener("click", () => {
      alert("Thank you for purchasing!");
    });
  });
  