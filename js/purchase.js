document.addEventListener('DOMContentLoaded', () => {
    const purchaseHistoryContainer = document.getElementById('purchase-history');

    function fetchPurchaseHistory() {
        fetch('/api/purchase-history')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.purchases.length > 0) {
                    const purchasesHTML = data.purchases.map(purchase => `
                        <div class="purchase-item">
                            <img src="${purchase.image_url}" alt="${purchase.model}" class="purchase-item-image">
                            <div class="purchase-item-details">
                                <h3>${purchase.model}</h3>
                                <p>Price: ฿${purchase.price.toFixed(2)}</p>
                                <p>Quantity: ${purchase.quantity}</p>
                                <p>Total: ฿${purchase.total.toFixed(2)}</p>
                                <p>Date: ${new Date(purchase.purchase_date).toLocaleString()}</p>
                            </div>
                        </div>
                    `).join('');
                    
                    purchaseHistoryContainer.innerHTML = purchasesHTML;
                } else {
                    purchaseHistoryContainer.innerHTML = '<p>No purchase history found.</p>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                purchaseHistoryContainer.innerHTML = '<p>Failed to load purchase history.</p>';
            });
    }

    // Check if there's a new purchase in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const newPurchaseId = urlParams.get('new_purchase_id');

    if (newPurchaseId) {
        // Fetch and display the new purchase
        fetch(`/api/purchase/${newPurchaseId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const newPurchaseHTML = `
                        <div class="new-purchase">
                            <h2>Thank you for your purchase!</h2>
                            <div class="purchase-item">
                                <img src="${data.purchase.image_url}" alt="${data.purchase.model}" class="purchase-item-image">
                                <div class="purchase-item-details">
                                    <h3>${data.purchase.model}</h3>
                                    <p>Price: ฿${data.purchase.price.toFixed(2)}</p>
                                    <p>Quantity: ${data.purchase.quantity}</p>
                                    <p>Total: ฿${data.purchase.total.toFixed(2)}</p>
                                    <p>Date: ${new Date(data.purchase.purchase_date).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    purchaseHistoryContainer.insertAdjacentHTML('afterbegin', newPurchaseHTML);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // Remove the new_purchase_id from the URL
        window.history.replaceState({}, document.title, "/purchase");
    }

    // Fetch all purchase history
    fetchPurchaseHistory();
});

