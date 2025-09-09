import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Asegurar carpeta "logs"
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Formato de colores para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Formato para archivos
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: 'info',
  transports: [
    // 🟢 Consola con colores
    new winston.transports.Console({
      format: consoleFormat
    }),

    // 📝 Archivo combinado (info, warn, error)
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat
    }),

    // 🔴 Solo errores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat
    })
  ]
});

export default logger;
