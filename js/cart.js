document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    function fetchCartItems() {
        fetch('/api/cart')
            .then(response => response.json())
            .then(items => {
                if (items.length === 0) {
                    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
                    totalPriceElement.textContent = 'Total: $0.00';
                } else {
                    let totalPrice = 0;
                    const itemsHTML = items.map(item => {
                        totalPrice += item.price * item.quantity;
                        return `
                            <div class="cart-item" data-id="${item.id}" data-product-id="${item.products_id}">
                                <img src="${item.image_url}" alt="${item.model}" class="cart-item-image">
                                <div class="cart-item-details">
                                    <h3>${item.model}</h3>
                                    <p>Price: $${item.price.toFixed(2)}</p>
                                    <div class="quantity-controls">
                                        <button class="quantity-btn minus">-</button>
                                        <span class="quantity">${item.quantity}</span>
                                        <button class="quantity-btn plus">+</button>
                                    </div>
                                    <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
                                    <button class="remove-btn">Remove</button>
                                    <button class="buy-now-btn">Buy Now</button>
                                </div>
                            </div>
                        `;
                    }).join('');
                    
                    cartContainer.innerHTML = itemsHTML;
                    totalPriceElement.textContent = `Total: $${totalPrice.toFixed(2)}`;

                    // Add event listeners for quantity controls, remove buttons, and buy now buttons
                    addCartItemListeners();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                cartContainer.innerHTML = '<p>Failed to load cart items.</p>';
            });
    }

    function addCartItemListeners() {
        const quantityBtns = document.querySelectorAll('.quantity-btn');
        const removeBtns = document.querySelectorAll('.remove-btn');
        const buyNowBtns = document.querySelectorAll('.buy-now-btn');

        quantityBtns.forEach(btn => {
            btn.addEventListener('click', updateQuantity);
        });

        removeBtns.forEach(btn => {
            btn.addEventListener('click', removeItem);
        });

        buyNowBtns.forEach(btn => {
            btn.addEventListener('click', buyNow);
        });
    }

    function updateQuantity(event) {
        const btn = event.target;
        const cartItem = btn.closest('.cart-item');
        const itemId = cartItem.dataset.id;
        const quantityElement = cartItem.querySelector('.quantity');
        let newQuantity = parseInt(quantityElement.textContent);

        if (btn.classList.contains('plus')) {
            newQuantity++;
        } else if (btn.classList.contains('minus') && newQuantity > 1) {
            newQuantity--;
        }

        fetch(`/api/cart/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: newQuantity }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                quantityElement.textContent = newQuantity;
                fetchCartItems(); // Refresh the entire cart to update totals
            } else {
                alert('Failed to update quantity. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }

    function removeItem(event) {
        const btn = event.target;
        const cartItem = btn.closest('.cart-item');
        const itemId = cartItem.dataset.id;

        fetch(`/api/cart/${itemId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchCartItems(); // Refresh the entire cart
            } else {
                alert('Failed to remove item. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }

    function buyNow(event) {
        const btn = event.target;
        const cartItem = btn.closest('.cart-item');
        const productId = cartItem.dataset.productId;
        const quantity = parseInt(cartItem.querySelector('.quantity').textContent);

        showBuyNowPopup(productId, quantity);
    }

    function showBuyNowPopup(productId, quantity) {
        const popup = document.createElement('div');
        popup.className = 'buy-now-popup';
        popup.innerHTML = `
            <h2>Complete Your Purchase</h2>
            <form id="buy-now-form">
                <input type="hidden" name="product_id" value="${productId}">
                <input type="hidden" name="quantity" value="${quantity}">
                <input type="text" name="name" placeholder="Full Name" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="text" name="address" placeholder="Shipping Address" required>
                <input type="text" name="card" placeholder="Credit Card Number" required>
                <button type="submit" class="btn btn-primary">Confirm Purchase</button>
                <button type="button" class="btn btn-outline-secondary" onclick="this.closest('.buy-now-popup').remove()">Cancel</button>
            </form>
        `;
        document.body.appendChild(popup);

        document.getElementById('buy-now-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const purchaseData = {
                product_id: formData.get('product_id'),
                quantity: formData.get('quantity'),
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
                    window.location.href = '/purchase';
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

    // Initial fetch of cart items
    fetchCartItems();
});

