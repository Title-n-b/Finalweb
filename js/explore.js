
document.addEventListener("DOMContentLoaded", () => {
    const specificProductContainer = document.getElementById("specific-product");

    // ดึงข้อมูลสินค้าตำแหน่งที่ 2
    fetch("/api/product/2")
        .then((response) => response.json())
        .then((product) => {
            if (product) {
                // สร้าง HTML สำหรับสินค้า
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
                                    <p class="card-text">${product.description}</p>
                                    <div class="price">Price $${product.price ? product.price.toFixed(2) : 'N/A'}</div>
                                    <div class="actions">
                                        <button class="btn btn-success">Add to card</button>
                                        <button class="btn btn-outline-success heart-btn">
                                            <i class="fas fa-heart"></i>
                                        </button>
                                        <div class="quantity">
                                            <button class="btn btn-outline-success">-</button>
                                            <input type="text" value="1"/>
                                            <button class="btn btn-outline-success">+</button>
                                        </div>
                                        <button class="btn btn-success">Buy Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                specificProductContainer.innerHTML = `<p>No product found.</p>`;
            }
        })
        .catch((error) => {
            console.error("Error fetching product:", error);
            specificProductContainer.innerHTML = `<p>Failed to load product. Error: ${error.message}</p>`;
        });
});
///
//กดปุ่มsaved ยังไม่ได้
// document.querySelectorAll('.heart-btn').forEach(button => {
//     button.addEventListener('click', () => {
//         const productId = button.closest('.product-card').getAttribute('data-id');
//         console.log('Saving product ID:', productId); // Log ID ที่ส่งไป

//         fetch('/api/save-favorite', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ productId }),
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Response from server:', data); // Log ผลลัพธ์จากเซิร์ฟเวอร์
//             if (data.success) {
//                 alert('Saved to favorites!');
//                 button.classList.add('saved');
//             } else {
//                 alert(`Error: ${data.message}`);
//             }
//         })
//         .catch(error => {
//             console.error('Error during fetch:', error); // Log ข้อผิดพลาดจาก fetch
//         });
//     });
// });


//
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