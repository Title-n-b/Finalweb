document.addEventListener('DOMContentLoaded', () => {
    const savedProductsContainer = document.getElementById('saved-products');

    // Load favorites from local storage
    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.length > 0) {
            savedProductsContainer.innerHTML = favorites.map(product => `
                <div class="card product-card mb-4" data-id="${product.id}">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${product.image}" 
                                 class="img-fluid rounded-start" 
                                 alt="${product.name}">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <div class="rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <span>(200+ Reviews)</span>
                                </div>
                                <p class="card-text">${product.description || 'No description available.'}</p>
                                <div class="price">${product.price}</div>
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
            `).join('');
        } else {
            savedProductsContainer.innerHTML = `<p>No saved products yet.</p>`;
        }
    }

    // Remove product from favorites
    savedProductsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-favorite')) {
            const productCard = e.target.closest('.product-card');
            const productId = productCard.getAttribute('data-id');

            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favorites = favorites.filter(item => item.id !== productId);
            localStorage.setItem('favorites', JSON.stringify(favorites));

            // Reload favorites
            loadFavorites();
        }
    });

    // Load favorites on page load
    loadFavorites();
});
