import http from 'http';
import fs from 'fs/promises';

//
import express from 'express';
import path from 'path';
import mysql from 'mysql';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // อนุญาตการเชื่อมต่อจากต่างโดเมน
app.use(express.json()); // รองรับ JSON
//


// Serve static files
app.use('/js', express.static(path.join(__dirname, '/js')));
// เสิร์ฟไฟล์ Static (HTML, CSS, JS) จากโฟลเดอร์โปรเจกต์
app.use(express.static(__dirname));

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DataFinalPT',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to the database.');
});


// API สำหรับดึงข้อมูลสินค้า
app.get('/api/products', (req, res) => {
    const sql = `
        SELECT products.model, products.price, products.image_url, 
               brands.name AS brand_name, categories.name AS category_name 
        FROM products
        JOIN brands ON products.brand_id = brands.id
        JOIN categories ON products.category_id = categories.id
    `;
    db.query(sql, (err, results) => {
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




const server = http.createServer(async(req, res) => {
    console.log('Request URL:', req.url); // เพิ่ม log เพื่อดู URL ที่ถูกเรียก

    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // แก้ไขการจัดการ content type
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    try {
        const content = await fs.readFile(path.join(__dirname, filePath), 'utf-8');
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        console.error('Error reading file:', error.message);

        if (error.code === 'ENOENT') {
            try {
                const notFoundContent = await fs.readFile(path.join(__dirname, '404.html'), 'utf-8');
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(notFoundContent);
            } catch (notFoundError) {
                console.error('404.html file not found:', notFoundError.message);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            }
        } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Server Error: ${error.message}`);
        }
    }
});

const port = 3500;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});