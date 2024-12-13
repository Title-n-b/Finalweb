document.addEventListener('DOMContentLoaded', () => {
    const savedItemsContainer = document.getElementById('saved-items');

    function fetchSavedItems() {
        fetch('/api/saved')
            .then(response => response.json())
            .then(items => {
                if (items.length === 0) {
                    savedItemsContainer.innerHTML = '<p>You have no saved items.</p>';
                } else {
                    const itemsHTML = items.map(item => `
                        <div class="saved-item" data-id="${item.id}">
                            <img src="${item.image_url}" alt="${item.model}" class="saved-item-image">
                            <div class="saved-item-details">
                                <h3>${item.model}</h3>
                                <p>Price: ฿${item.price.toFixed(2)}</p>
                                <button class="add-to-cart-btn" data-product-id="${item.products_id}">Add to Cart</button>
                                <button class="remove-saved-btn">Remove</button>
                            </div>
                        </div>
                    `).join('');
                    
                    savedItemsContainer.innerHTML = itemsHTML;

                    // Add event listeners for add to cart and remove buttons
                    addSavedItemListeners();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                savedItemsContainer.innerHTML = '<p>Failed to load saved items.</p>';
            });
    }

    function addSavedItemListeners() {
        const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
        const removeSavedBtns = document.querySelectorAll('.remove-saved-btn');

        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', addToCart);
        });

        removeSavedBtns.forEach(btn => {
            btn.addEventListener('click', removeSavedItem);
        });
    }

    function addToCart(event) {
        const btn = event.target;
        const productId = btn.dataset.productId;

        fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId, quantity: 1 }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Item added to cart successfully!');
            } else {
                alert('Failed to add item to cart. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }

    function removeSavedItem(event) {
        const btn = event.target;
        const savedItem = btn.closest('.saved-item');
        const itemId = savedItem.dataset.id;

        fetch(`/api/saved/${itemId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchSavedItems(); // Refresh the saved items list
            } else {
                alert('Failed to remove saved item. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }

    // Initial fetch of saved items
    fetchSavedItems();
});

