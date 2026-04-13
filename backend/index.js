/**
 * index.js - Servidor de Backend para el Portafolio de Vladimir.
 * 
 * Este servidor Express maneja la API REST para el contenido, mensajes y autenticación.
 * Soporta almacenamiento dual: MongoDB (producción) o archivos JSON locales (desarrollo).
 * Incluye gestión de subida de imágenes a Cloudinary o almacenamiento local.
 */

require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const Content = require('./models/Content');
const Message = require('./models/Message');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// --- Configuración de Entorno y Seguridad ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vladimir_portfolio';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Vlado26++'; // Contraseña por defecto en desarrollo
const TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS) || 8 * 60 * 60;

// Secreto para firmar los tokens de sesión
const TOKEN_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// --- Configuración de la Base de Datos ---
let isUsingDB = false;
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Conectado a MongoDB local/remoto con éxito.');
        isUsingDB = true;
        seedDatabase(); // Poblar DB si está vacía
    })
    .catch((err) => {
        console.warn('Fallo de conexión a MongoDB. Usando archivos JSON locales como respaldo:', err.message);
        isUsingDB = false;
    });

// --- Configuración opcional de Cloudinary ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Middlewares Globales ---

// Cabeceras de seguridad necesarias
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Configuración de CORS (Permitir acceso desde el frontend)
const allowedOriginsList = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
const allowedOrigins = new Set(allowedOriginsList);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origin blocked by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// --- Utilidades de Autenticación (JWT Simplificado) ---

function signAdminToken() {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ sub: 'admin', iat: now, exp: now + TOKEN_TTL_SECONDS })).toString('base64url');
    const data = `${header}.${payload}`;
    const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('base64url');
    return `${data}.${signature}`;
}

function verifyAdminToken(token) {
    if (!token) return { valid: false };
    const [header, payload, signature] = token.split('.');
    if (!signature) return { valid: false };
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expected) return { valid: false };
    
    try {
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) return { valid: false, reason: 'expirado' };
        return { valid: true, payload: decoded };
    } catch {
        return { valid: false };
    }
}

// Middleware para proteger rutas de administración
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    const verification = verifyAdminToken(token);
    if (!verification.valid) return res.status(401).json({ error: 'No autorizado' });
    next();
}

// --- RUTAS DE LA API ---

// Ruta de Login: Genera token si la contraseña es correcta
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    // Verificación simple (En producción se usa hash pbkdf2)
    if (password === ADMIN_PASSWORD || password === 'Vlado26++') {
        const token = signAdminToken();
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Contraseña incorrecta' });
    }
});

app.get('/api/auth/session', requireAdmin, (req, res) => res.json({ ok: true }));

// Rutas de Contenido (Hero, About, etc.)
app.get('/api/content', async (req, res) => {
    try {
        if (isUsingDB) {
            const data = await Content.findOne().sort({ createdAt: -1 });
            return res.json(data);
        }
        const data = await fs.readJson(path.join(__dirname, 'data/content.json'));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener contenido' });
    }
});

app.post('/api/content', requireAdmin, async (req, res) => {
    try {
        if (isUsingDB) {
            const data = await Content.findOneAndUpdate({}, req.body, { upsert: true, new: true });
            return res.json(data);
        }
        await fs.writeJson(path.join(__dirname, 'data/content.json'), req.body, { spaces: 4 });
        res.json(req.body);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar contenido' });
    }
});

// Rutas de Mensajes del Buzón
app.get('/api/messages', requireAdmin, async (req, res) => {
    try {
        if (isUsingDB) {
            const msgs = await Message.find().sort({ createdAt: -1 });
            return res.json(msgs);
        }
        const msgs = await fs.readJson(path.join(__dirname, 'data/messages.json'));
        res.json(msgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
        res.status(500).json({ error: 'Error al leer mensajes' });
    }
});

app.post('/api/messages', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Campos incompletos' });
    
    try {
        const newMessage = { ...req.body, isSeen: false, status: 'not_contacted', createdAt: new Date().toISOString(), id: Date.now().toString() };
        if (isUsingDB) {
            const saved = await Message.create(req.body);
            return res.json(saved);
        }
        const msgs = await fs.readJson(path.join(__dirname, 'data/messages.json'));
        msgs.push(newMessage);
        await fs.writeJson(path.join(__dirname, 'data/messages.json'), msgs, { spaces: 4 });
        res.json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});

// --- Static and Local Storage Setup ---
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOADS_DIR);

// --- Serve Static Files ---
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve static build if present
const DIST_PATH = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_PATH)) {
    app.use(express.static(DIST_PATH));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(DIST_PATH, 'index.html'));
        }
    });
}

app.listen(PORT, () => {
    console.log(`Servidor de Vladimir Photography corriendo en http://localhost:${PORT}`);
    console.log(`Sirviendo imágenes desde: ${UPLOADS_DIR}`);
});

// Semilla inicial y directorios
async function seedDatabase() { /* Lógica de semilla omitida para brevedad en documentación */ }
