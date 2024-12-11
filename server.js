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

// API routes
app.get('/api/products', (req, res) => {
    const sql = `
        SELECT products.model, products.price, products.image_url, 
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

// Page routes
app.get('/login', (req, res) => {
    if (req.session.userId) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/registration', (req, res) => {
    if (req.session.userId) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

app.get('/change-password', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'change-password.html'));
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

// Create HTTP server
const server = http.createServer(app);

const port = 3500;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

export default app;

