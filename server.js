import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs/promises';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors()); // Allow cross-domain connections
app.use(express.json()); // Support JSON

// Database connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Final_Web"
});

// Test database connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database successfully');
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "nontakantle25@gmail.com",
        pass: "fweq nmlb jgcb usiw"
    }
});

// ตั้งค่าโฟลเดอร์ views และ EJS
app.set('views', path.join(__dirname, 'views')); // กำหนดโฟลเดอร์สำหรับไฟล์ EJS
app.set('view engine', 'ejs'); // ตั้งค่า EJS เป็น template engine
// Serve static files
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        if (req.headers['content-type'] === 'application/json') {
            res.status(401).json({ message: 'Unauthorized' });
        } else {
            res.redirect('/login');
        }
    }
};
// Middleware to restrict access for users who are not logged in
const restrictAccess = (req, res, next) => {
    const allowedPaths = ["/", "/login", "/registration", "/api/login", "/api/register", "/forgot-password"];
    const requestedPath = req.path.toLowerCase();

    // Allow access only if logged in or path is explicitly allowed
    if (req.session.userId || allowedPaths.includes(requestedPath)) {
        next(); 
    } else if (requestedPath.endsWith('.html')) {
        // Redirect to login if trying to access HTML files without login
        res.redirect('/login'); 
    } else {
        // Redirect to login for other unauthorized access attempts
        res.redirect('/login');
    }
};



// Apply the middleware globally to all routes
app.use(restrictAccess);

// Example home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/explore', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'explore.html'));
});

app.get('/saved', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'saved.html'));
});

app.get('/cart', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

app.get('/purchase', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'purchase.html'));
});
app.get('/map', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'map.html'));
});
app.get('/product', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'product.html'));
});

//
// API Register
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    try {
        // เข้ารหัสรหัสผ่านก่อนบันทึก
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL Query
        const query = 'INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)';
        connection.query(query, [username, email, hashedPassword], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Database error' });
            }
            res.status(201).send({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'An error occurred' });
    }
});



// Get user info
app.get('/api/user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    res.json({ 
        username: req.session.username,
        isLoggedIn: true 
    });
});



// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    const query = 'SELECT * FROM accounts WHERE username = ?';
    connection.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        
        res.json({ 
            message: 'Login successful',
            username: user.username
        });
    });
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});


// API routes
app.get('/api/products', (req, res) => {
    const sql = `
        SELECT products.id, products.model, products.price, products.image_url, 
               brands.name AS brand_name, categories.name AS category_name 
        FROM products
        JOIN brands ON products.brand_id = brands.id
        JOIN categories ON products.category_id = categories.id
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'No products found' });
        }
    
        res.status(200).json(results);
    });
});

app.get('/api/products/:model', (req, res) => {
    const { model } = req.params;
    const sql = `
        SELECT products.model, products.price, products.image_url, 
               brands.name AS brand_name, categories.name AS category_name 
        FROM products
        JOIN brands ON products.brand_id = brands.id
        JOIN categories ON products.category_id = categories.id
        WHERE products.model = ?
    `;
    connection.query(sql, [model], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).json({ error: 'Failed to fetch product details' });
        }
    
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
    
        res.status(200).json(results[0]);
    });
});
//
app.get('/api/product/2', (req, res) => {
    const sql = `SELECT * FROM products ORDER BY id LIMIT 1 OFFSET 1;`; // ดึงสินค้าตำแหน่งที่ 2
    connection.query(sql, (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            res.status(500).json({ message: "Error fetching product" });
        } else if (result.length > 0) {
            res.json(result[0]); // ส่งข้อมูลสินค้าตำแหน่งที่ 2
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    });
});
//
// Get product by ID
app.get('/api/product/:id', (req, res) => {
    const productId = req.params.id;
    const sql = `SELECT * FROM products WHERE id = ?`;
    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ message: "Error fetching product" });
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    });
});

// Page routes
app.get('/login', (req, res) => {
    if (req.session.userId) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/registration', (req, res) => {
    if (req.session.userId) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, 'registration.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

app.get('/change-password', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'change-password.html'));
});

// Authentication routes
app.post('/api/register', async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;

        if (password !== retypePassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (username, email, password)
            VALUES (?, ?, ?)
        `;

        connection.query(
            query,
            [fullname, birth, sex, phone, email, username, hashedPassword],
            (error, results) => {
                if (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        if (error.message.includes('email')) {
                            return res.status(400).json({ message: 'Email already exists' });
                        }
                        return res.status(400).json({ message: 'Username already exists' });
                    }
                    console.error('Registration error:', error);
                    return res.status(500).json({ message: 'Error creating user' });
                }
                res.json({ message: 'Registration successful' });
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add to cart
app.post('/api/cart', requireLogin, (req, res) => {
    console.log('ข้อมูลที่ได้รับจาก request:', req.body);
    const { product_id, quantity } = req.body;
    console.log('ได้รับคำขอเพิ่มสินค้าลงตะกร้า:', { product_id, quantity });

    if (!product_id || product_id === 'undefined') {
        console.error('ไม่พบ Product ID ในคำขอ');
        return res.status(400).json({ success: false, message: 'กรุณาระบุ Product ID' });
    }

    const account_id = req.session.userId;

    // ดึงข้อมูลสินค้า
    const productQuery = 'SELECT * FROM products WHERE id = ?';
    connection.query(productQuery, [product_id], (err, productResults) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดกับฐานข้อมูล:', err);
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดกับฐานข้อมูล' });
        }
        if (productResults.length === 0) {
            console.error('ไม่พบสินค้า ID:', product_id);
            return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });
        }

        const product = productResults[0];
        const total = product.price * quantity;

        // เพิ่มลงตะกร้า
        const insertQuery = `
            INSERT INTO cart (account_id, username, brand_id, products_id, model, price, image_url, quantity, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(insertQuery, [
            account_id,
            req.session.username,
            product.brand_id,
            product.id,
            product.model,
            product.price,
            product.image_url,
            quantity,
            total
        ], (insertErr) => {
            if (insertErr) {
                console.error('เกิดข้อผิดพลาดในการเพิ่มลงตะกร้า:', insertErr);
                return res.status(500).json({ success: false, message: 'ไม่สามารถเพิ่มลงตะกร้าได้' });
            }
            console.log('เพิ่มสินค้าลงตะกร้าสำเร็จ:', { product_id, quantity });
            res.json({ success: true, message: 'เพิ่มลงตะกร้าสำเร็จ' });
        });
    });
});



// Save item
app.post('/api/saved', requireLogin, (req, res) => {
    const { product_id } = req.body;
    const account_id = req.session.userId;

    // First, get the product details
    const productQuery = 'SELECT * FROM products WHERE id = ?';
    connection.query(productQuery, [product_id], (err, productResults) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (productResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = productResults[0];

        // Now insert into the saved table
        const insertQuery = `
            INSERT INTO saved (account_id, username, brand_id, products_id, model, price, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(insertQuery, [
            account_id,
            req.session.username,
            product.brand_id,
            product.id,
            product.model,
            product.price,
            product.image_url
        ], (insertErr) => {
            if (insertErr) {
                return res.status(500).json({ success: false, message: 'Failed to save item' });
            }
            res.json({ success: true, message: 'Item saved successfully' });
        });
    });
});

// Get cart items
app.get('/api/cart', requireLogin, (req, res) => {
    const account_id = req.session.userId;
    const query = 'SELECT * FROM cart WHERE account_id = ?';
    connection.query(query, [account_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json(results);
    });
});

// Update cart item quantity
app.put('/api/cart/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const account_id = req.session.userId;

    const query = 'UPDATE cart SET quantity = ?, total = price * ? WHERE id = ? AND account_id = ?';
    connection.query(query, [quantity, quantity, id, account_id], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
        res.json({ success: true, message: 'Cart updated successfully' });
    });
});

// Remove item from cart
app.delete('/api/cart/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const account_id = req.session.userId;

    const query = 'DELETE FROM cart WHERE id = ? AND account_id = ?';
    connection.query(query, [id, account_id], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
        res.json({ success: true, message: 'Item removed from cart successfully' });
    });
});

// Get saved items
app.get('/api/saved', requireLogin, (req, res) => {
    const account_id = req.session.userId;
    const query = 'SELECT * FROM saved WHERE account_id = ?';
    connection.query(query, [account_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json(results);
    });
});

// Remove saved item
app.delete('/api/saved/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const account_id = req.session.userId;

    const query = 'DELETE FROM saved WHERE id = ? AND account_id = ?';
    connection.query(query, [id, account_id], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Saved item not found' });
        }
        res.json({ success: true, message: 'Item removed from saved list successfully' });
    });
});

// Get purchase history
app.get('/api/purchase-history', requireLogin, (req, res) => {
    const account_id = req.session.userId;
    const query = 'SELECT * FROM purchase WHERE account_id = ? ORDER BY purchase_date DESC';
    connection.query(query, [account_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, purchases: results });
    });
});
// Handle purchase
app.post('/api/purchase', requireLogin, (req, res) => {
    const { product_id, quantity, name, email, address, card } = req.body;
    const account_id = req.session.userId;

    console.log('Purchase attempt:', { product_id, quantity, name, email, address: address.substring(0, 10) + '...', card: '****' + card.slice(-4) });

    if (!product_id) {
        console.error('Product ID is missing');
        return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // First, get the product details
    const productQuery = 'SELECT * FROM products WHERE id = ?';
    connection.query(productQuery, [product_id], (err, productResults) => {
        if (err) {
            console.error('Database error when fetching product:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (productResults.length === 0) {
            console.error('Product not found:', product_id);
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = productResults[0];
        const total = product.price * quantity;

        console.log('Product found:', { id: product.id, model: product.model, price: product.price, total });

        // Now insert into the purchase table
        const insertQuery = `
            INSERT INTO purchase (account_id, username, name, email, address, card_number, brand_id, products_id, model, price, image_url, quantity, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(insertQuery, [
            account_id,
            req.session.username,
            name,
            email,
            address,
            card, // In a real application, you should encrypt this before storing
            product.brand_id,
            product.id,
            product.model,
            product.price,
            product.image_url,
            quantity,
            total
        ], (insertErr, result) => {
            if (insertErr) {
                console.error('Insert error:', insertErr);
                return res.status(500).json({ success: false, message: 'Failed to process purchase' });
            }
            console.log('Purchase successful:', { account_id, username: req.session.username, product_id, quantity, total });
            
            // Remove the purchased item from the cart
            const removeFromCartQuery = 'DELETE FROM cart WHERE account_id = ? AND products_id = ?';
            connection.query(removeFromCartQuery, [account_id, product_id], (removeErr, removeResult) => {
                if (removeErr) {
                    console.error('Error removing item from cart:', removeErr);
                    // We don't want to fail the purchase if cart removal fails, so we just log the error
                }
                
                // Fetch the newly inserted purchase
                const purchaseQuery = `SELECT * FROM purchase WHERE id = ?`;
                connection.query(purchaseQuery, [result.insertId], (purchaseErr, purchaseResults) => {
                    if (purchaseErr) {
                        console.error('Error fetching purchase:', purchaseErr);
                        return res.status(500).json({ success: true, message: 'Purchase successful, but failed to fetch details' });
                    }
                    res.json({ success: true, message: 'Purchase successful', purchase: purchaseResults[0] });
                });
            });
        });
    });
});
///
app.get('/resetpass', (req, res) => {
    res.render('resetpassword.ejs');
});

app.post('/resetpass', (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const username = req.session.userID;

    if (newPassword !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Internal server error');
            }

            db.query('UPDATE accounts SET password = ? WHERE username = ?', [hash, username], (err) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).send('Database error');
                }
                console.log('Password reset successful');
                res.redirect('/index');
            });
        });
    });
});

///


// Create HTTP server
const server = http.createServer(app);

const port = 3500;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

export default app;

