import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import logger from './utils/logger.js'; 

// Rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productsRoutes from './routes/products.routes.js';
import cartRoutes from './routes/cart.routes.js';
import authDashboard from './routes/authDashboard.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import categoriesAdminRoutes from './routes/categoriesAdmin.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import contact from './routes/contact.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadApp() {
  const app = express();

  // --- CORS ---
  const allowedOrigins = [
    'http://localhost:5173',
    'https://frontend-proyect-production.up.railway.app'
  ];

  const corsOptions = {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true); // Postman u otras herramientas
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS Error: Origen no permitido'));
      }
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // Responde a todos los preflights

  // --- Logger HTTP ---
  app.use(morgan('dev'));

  // --- Seguridad con Helmet ---
  app.use(helmet({
    contentSecurityPolicy: false, // evitar conflictos con React y APIs externas
    hidePoweredBy: true,
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'no-referrer' }
  }));
  logger.info('🛡️ Helmet security middlewares aplicados');

  // --- Body parser y cookies ---
  app.use(bodyParser.json());
  app.use(cookieParser());

  // --- Archivos estáticos ---
  app.use('/uploads', express.static(join(__dirname, '/uploads')));

  // --- Rutas ---
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/dashboard', authDashboard);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/admin/categories', categoriesAdminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/contact-us', contact);

  logger.info('🚀 App cargada con todas las rutas y middlewares.');

  // --- Middleware global de errores ---
  app.use((err, req, res, next) => {
    logger.error(`❌ Error en ${req.method} ${req.url} - ${err.message}`);
    const status = err.status || 500;
    const message = err.message || 'Error interno del servidor';
    res.status(status).json({ error: message });
  });

  return app;
}
