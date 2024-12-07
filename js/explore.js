document.addEventListener('DOMContentLoaded', function() {
    const exploreProductsContainer = document.getElementById('explore-products');
    
    // Display all products
    products.forEach(product => {
        exploreProductsContainer.innerHTML += createProductCard(product);
    });
});