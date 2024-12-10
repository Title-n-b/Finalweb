document.addEventListener('DOMContentLoaded', function() {
    const exploreProductsContainer = document.getElementById('explore-products');
    
    // Display all products
    products.forEach(product => {
        exploreProductsContainer.innerHTML += createProductCard(product);
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