document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired.");
    const specificProductContainer = document.getElementById("specific-product");
    let quantity = 1;

    // Fetch and display a specific product
    fetch("/api/product/2")
        .then((response) => response.json())
        .then((product) => {
            console.log("Product fetched:", product);
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

                console.log("Product HTML generated.");

                // Add event listeners after the HTML is generated
                document.getElementById("increase-quantity").addEventListener("click", () => {
                    console.log("Increase quantity button clicked.");
                    quantity++;
                    document.getElementById("quantity-input").value = quantity;
                });

                document.getElementById("decrease-quantity").addEventListener("click", () => {
                    console.log("Decrease quantity button clicked.");
                    if (quantity > 1) {
                        quantity--;
                        document.getElementById("quantity-input").value = quantity;
                    }
                });

                document.getElementById("add-to-cart").addEventListener("click", () => {
                    console.log("Add to Cart button clicked.");
                    addToCart(product.id, quantity);
                });

                document.getElementById("save-item").addEventListener("click", () => {
                    console.log("Save Item button clicked.");
                    saveItem(product.id);
                });

                document.getElementById("buy-now").addEventListener("click", () => {
                    console.log("Buy Now button clicked.");
                    showBuyNowPopup(product, quantity);
                });
            } else {
                console.warn("No product found.");
                specificProductContainer.innerHTML = `<p>No product found.</p>`;
            }
        })
        .catch((error) => {
            console.error("Error fetching product:", error);
            specificProductContainer.innerHTML = `<p>Failed to load product. Error: ${error.message}</p>`;
        });

    
});

document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.getElementById("explore-products");

    // ดึงข้อมูลสินค้าและแสดงผล
    fetch("/api/products")
        .then((response) => response.json())
        .then((data) => {
            console.log("ข้อมูลสินค้าที่ได้รับ:", data);
            if (Array.isArray(data) && data.length > 0) {
                // สร้าง HTML สำหรับแต่ละสินค้า
                const productsHTML = data.map(product => {
                    // ตรวจสอบว่ามี id จริงๆ
                    if (!product.id) {
                        console.warn("พบสินค้าที่ไม่มี ID:", product);
                        return ''; // ข้ามสินค้าที่ไม่มี ID
                    }

                    return `
                        <div class="deal-card">
                            <img src="${product.image_url || 'default-image.jpg'}" alt="${product.model || 'ไม่มีชื่อรุ่น'}">
                            <h3>${product.model || 'สินค้าไม่มีชื่อ'}</h3>
                            <div class="price">ราคา B${product.price ? product.price.toFixed(2) : 'ไม่ระบุ'}</div>
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <span>4.9</span>
                            </div>
                            <button type="button" class="btn btn-success add-to-cart-btn" data-product-id="${product.id}">
                                <i class="fas fa-plus"></i> เพิ่มลงตะกร้า
                            </button>
                        </div>
                    `;
                }).join("");

                productGrid.innerHTML = productsHTML;

                // เพิ่ม event listeners หลังจากสร้าง HTML เสร็จ
                document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                    button.addEventListener('click', function(e) {
                        // ป้องกันการ bubble ของ event
                        e.preventDefault();
                        e.stopPropagation();

                        // ดึง ID จาก data attribute
                        const productId = this.getAttribute('data-product-id');
                        console.log("กำลังเพิ่มสินค้า ID:", productId);

                        if (productId) {
                            addToCart(productId, 1);
                        } else {
                            console.error("ไม่พบ Product ID ในปุ่ม");
                            alert("เกิดข้อผิดพลาด: ไม่พบรหัสสินค้า");
                        }
                    });
                });
            } else {
                console.error("ไม่พบข้อมูลสินค้า หรือข้อมูลไม่ถูกต้อง");
                productGrid.innerHTML = '<p>ไม่พบสินค้า</p>';
            }
        })
        .catch((error) => {
            console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", error);
            productGrid.innerHTML = `<p>ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่อีกครั้ง</p>`;
        });
});

//ค้นหาสินค้า 
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const productGrid = document.getElementById("explore-products");

    let products = []; // เก็บข้อมูลสินค้า

    // ดึงข้อมูลสินค้าเมื่อหน้าโหลด
    fetch("/api/products")
        .then((response) => response.json())
        .then((data) => {
            products = data; // เก็บสินค้าในตัวแปร
            displayProducts(products); // แสดงสินค้าทั้งหมด
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
        });

    // ฟังก์ชันสำหรับแสดงสินค้า
    function displayProducts(productsToDisplay) {
        productGrid.innerHTML = productsToDisplay
            .map(
                (product) => `
            <div class="deal-card">
                <img src="${product.image_url || 'default-image.jpg'}" alt="${product.model || 'No model'}">
                <h3>${product.model || 'Unnamed Product'}</h3>
                <div class="price">Price $${product.price ? product.price.toFixed(2) : 'N/A'}</div>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>4.9</span>
                </div>
                <button type="button" class="btn btn-success add-to-cart-btn" data-product-id="${product.id}">
                                <i class="fas fa-plus"></i> เพิ่มลงตะกร้า
                            </button>
            </div>
          `
            )
            .join("");
           // เพิ่ม Event Listener ให้ปุ่ม "Add to Cart" หลังจากอัปเดต DOM
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            const productId = button.getAttribute("data-product-id");
            if (productId) {
                addToCart(productId, 1); // เพิ่มสินค้าไปยังตะกร้า
            } else {
                console.error("Product ID not found in button");
                alert("เกิดข้อผิดพลาด: ไม่พบรหัสสินค้า");
            }
        });
    });
    }

    // ฟังก์ชันค้นหาสินค้า
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // กรองสินค้าที่ตรงกับคำค้นหา
        const filteredProducts = products.filter((product) =>
            product.model.toLowerCase().includes(searchTerm)
        );

        // แสดงสินค้าที่กรองแล้ว
        displayProducts(filteredProducts);
    });
});

// Function to add product to cart
function addToCart(productId, quantity) {
    // ตรวจสอบความถูกต้องของ input
    if (!productId) {
        console.error("ไม่ได้ระบุ Product ID");
        alert("เกิดข้อผิดพลาด: ไม่พบรหัสสินค้า");
        return;
    }

    // แสดง log เพื่อการ debug
    console.log("กำลังเพิ่มสินค้าลงตะกร้า:", { productId, quantity });

    // ส่งคำขอไปยังเซิร์ฟเวอร์
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
        console.log("สถานะการตอบกลับ:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("ผลการเพิ่มสินค้า:", data);
        if (data.success) {
            alert("เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว");
        } else {
            alert(data.message || "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้");
        }
    })
    .catch(error => {
        console.error("เกิดข้อผิดพลาด:", error);
        alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาลองใหม่อีกครั้ง");
    });
}



// Function to save item
function saveItem(productId) {
    console.log("saveItem called with productId:", productId);
    fetch("/api/saved", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            product_id: productId,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Response from saveItem:", data);
            if (data.success) {
                alert("Item saved successfully!");
                const saveButton = document.getElementById("save-item");
                saveButton.classList.add("saved");
                saveButton.disabled = true;
                saveButton.textContent = "Saved";
            } else {
                alert("Failed to save item. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Error in saveItem:", error);
            alert("An error occurred. Please try again.");
        });
}



// Function to show Buy Now popup
function showBuyNowPopup(product, quantity) {
    console.log("showBuyNowPopup called with:", { product, quantity });
    const popup = document.createElement("div");
    popup.className = "buy-now-popup";
    popup.innerHTML = `
        <h2>Complete Your Purchase</h2>
        <form id="buy-now-form">
            <input type="hidden" name="product_id" value="${product.id}">
            <input type="text" name="name" placeholder="Full Name" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="text" name="address" placeholder="Shipping Address" required>
            <input type="text" name="card" placeholder="Credit Card Number" required>
            <button type="submit" class="btn btn-primary">Confirm Purchase</button>
            <button type="button" class="btn btn-outline-secondary" onclick="this.closest('.buy-now-popup').remove()">Cancel</button>
        </form>
    `;
    document.body.appendChild(popup);

    document.getElementById("buy-now-form").addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Buy Now form submitted.");
        const formData = new FormData(e.target);
        const purchaseData = {
            product_id: formData.get("product_id"),
            quantity: quantity,
            name: formData.get("name"),
            email: formData.get("email"),
            address: formData.get("address"),
            card: formData.get("card"),
        };
        console.log("Purchase data:", purchaseData);

        fetch("/api/purchase", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(purchaseData),
        })
        .then((response) => {
            console.log("Response status:", response.status);
            return response.json();
        })
        .then((data) => {
            console.log("Response data:", data);
            if (data.success) {
                alert("Purchase successful!");
                popup.remove();
                if (data.purchase && data.purchase.id) {
                    window.location.href = `/purchase?new_purchase_id=${data.purchase.id}`;
                } else {
                    console.error("Purchase ID not found in response");
                    window.location.href = '/purchase';
                }
            } else {
                alert("Failed to complete purchase. " + (data.message || "Please try again."));
            }
        })
        .catch((error) => {
            console.error("Error in purchase:", error);
            alert("An error occurred. Please try again.");
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

