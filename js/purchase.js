document.addEventListener('DOMContentLoaded', function() {
    const purchaseForm = document.getElementById('purchase-form');

    purchaseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you would typically send the form data to a server
        // For this example, we'll just log it and clear the cart
        console.log('Purchase submitted');
        localStorage.removeItem('cart');
        alert('Thank you for your purchase!');
        window.location.href = 'index.html';
    });
});