// middleware/rateLimitMiddleware.js
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { sendSecurityAlertEmail } from '../utils/sendCode.js';
import { findUserEmail } from '../service/userService.js';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 📊 Revisa si una IP fue bloqueada más de 6 veces en 1 hora en el archivo dado
const checkIpAbuse = (ip, nowISO, filePath, userEmail = null) => {
  try {
    const oneHourAgo = new Date(new Date(nowISO).getTime() - 60 * 60 * 1000);
    const logData = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
    const lines = logData.split('\n');

    let count = 0;
    for (const line of lines) {
      if (line.includes(`IP: ${ip}`)) {
        const match = line.match(/^\[(.*?)\]/);
        if (match) {
          const logTime = new Date(match[1]);
          if (logTime >= oneHourAgo) {
            count++;
          }
        }
      }
    }

    if (count >= 6) {
      const alert = `[${nowISO}] 🚨 ALERTA: IP sospechosa ${ip} con ${count} bloqueos en 1 hora. Usuario: ${userEmail || 'desconocido'}\n`;
      console.warn(alert);
      fs.appendFileSync(path.join(logDir, 'alerts.log'), alert);

      if (userEmail) {
        sendSecurityAlertEmail(alert, userEmail);
      }
    }
  } catch (err) {
    console.error('Error al verificar IP abusiva:', err.message);
  }
};

// 🔒 Función genérica para registrar intentos bloqueados
const logBlockedAttempt = (req, reason, userEmail = null) => {
  const ip = req.ip;
  const fingerprint = req.headers['x-client-fingerprint'] || 'sin fingerprint';
  const userAgent = req.headers['user-agent'] || 'sin user-agent';
  const time = new Date().toISOString();
  const endpoint = req.originalUrl;

  const logFileMap = {
    'login': path.join(logDir, 'login-rate-limit.log'),
    'forgot-password': path.join(logDir, 'forgot-password-rate-limit.log'),
  };

  const logPath = logFileMap[reason] || path.join(logDir, 'rate-limit.log');

  const logLine = `[${time}] 🔒 Bloqueado (${reason}) | IP: ${ip} | Endpoint: ${endpoint} | Fingerprint: ${fingerprint} | UA: ${userAgent}\n`;
  fs.appendFileSync(logPath, logLine);

  checkIpAbuse(ip, time, logPath, userEmail);
};

// Rate limiter para login
export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // ⏱️ 5 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res, next) => {
    const ip = req.ip;
    const time = new Date().toISOString();
    const email = req.body?.email || null;

    const retryAfterMs = req.rateLimit?.resetTime
      ? new Date(req.rateLimit.resetTime) - new Date()
      : 5 * 60 * 1000; // fallback

    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);

    const userEmail = email ? await findUserEmail(email) : null;

    // Log + chequeo de abuso
    logBlockedAttempt(req, 'login', userEmail);

    res.status(429).json({
      message: `Demasiados intentos. Debes esperar ${retryAfterMinutes} minuto(s) antes de volver a intentarlo.`,
      retry_after_seconds: retryAfterSeconds
    });
  },
});

// Rate limiter para forgot-password
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ⏱️ 15 minutos
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logBlockedAttempt(req, 'forgot-password');
    res.status(429).json({
      message: 'Demasiadas solicitudes para recuperar contraseña. Intenta más tarde.'
    });
  },
});
