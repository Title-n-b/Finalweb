document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    function displayCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                total += product.price;
                cartItemsContainer.innerHTML += `
                    <div class="cart-item">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="cart-item-info">
                            <h3>${product.name}</h3>
                            <p>Price: $${product.price}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button onclick="removeFromCart(${product.id})">Remove</button>
                        </div>
                    </div>
                `;
            }
        });

        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
    }

    displayCartItems();

    checkoutButton.addEventListener('click', () => {
        window.location.href = 'purchase.html';
    });

    window.removeFromCart = function(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    };
});