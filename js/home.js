document.addEventListener('DOMContentLoaded', function() {
    const featuredProductsContainer = document.getElementById('featured-products');
    
    // Display featured products
    products.forEach(product => {
        featuredProductsContainer.innerHTML += createProductCard(product);
    });
});