import fs from 'fs';
import path from 'path';
import { insertNotification } from '../models/notificationsModel.js';

// 📂 Directorio de logs
const logDir = path.join(process.cwd(), 'logs');
const logPath = path.join(logDir, 'admin-access.log');

// 🛠️ Asegurar que la carpeta logs exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const adminSecurityMiddleware = async (req, res, next) => {
  const { user } = req;
  const ip = req.ip;
  const endpoint = req.originalUrl;
  const fingerprint = req.headers['x-client-fingerprint'] || 'sin fingerprint';
  const time = new Date().toISOString();

  try {
    if (!user || user.role !== 'admin') {
      const log = `[${time}] 🚫 BLOQUEADO | IP: ${ip} | Endpoint: ${endpoint} | Fingerprint: ${fingerprint} | Usuario: ${user?.email || 'anónimo'}\n`;
      fs.appendFileSync(logPath, log);

      // 🚨 Notificar al admin
      await insertNotification({
        user_id: null, // null = solo admin
        title: "Intento de acceso no autorizado",
        message: `Se bloqueó el acceso al endpoint ${endpoint} desde IP ${ip}`,
        is_global: false,
        type: "alert",
      });

      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const log = `[${time}] ✅ ACCESO | IP: ${ip} | Endpoint: ${endpoint} | Usuario: ${user.email}\n`;
    fs.appendFileSync(logPath, log);

    // (Opcional) También puedes notificar accesos válidos de admin
    await insertNotification({
      user_id: user.id, // Guardamos para el admin mismo
      title: "Acceso autorizado",
      message: `Acceso a ${endpoint} desde IP ${ip}`,
      is_global: false,
      type: "info",
    });

    next();
  } catch (err) {
    console.error("❌ Error en adminSecurityMiddleware:", err);
    return res.status(500).json({ message: "Error en seguridad de acceso" });
  }
};
