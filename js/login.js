document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Here you would typically send the login data to a server for authentication
        // For this example, we'll just log it
        console.log('Login attempt', { email, password });
        alert('Login functionality would be implemented here.');
    });
});