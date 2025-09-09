// routes/notificationRoutes.js
import express from 'express';
import {
  getNotificationsController,
  deleteNotificationController,
  markNotificationsReadController,
  createGlobalNotificationController,
  markGlobalNotificationReadController
} from '../controllers/notificationsController.js'; // ✅ corregido el import

import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 📌 Crear notificación global (solo admin)
 * POST /api/notifications/add-global-notification
 */
router.post(
  '/add-global-notification',
  verifyToken,
  checkRole(['admin']),
  createGlobalNotificationController
);

/**
 * 📌 Obtener notificaciones de un usuario
 * GET /api/notifications/:userId
 */
router.get('/:userId', verifyToken, getNotificationsController);

/**
 * 📌 Marcar todas las notificaciones de un usuario como leídas
 * PUT /api/notifications/mark-read/:userId
 */
router.put('/mark-read/:userId', verifyToken, markNotificationsReadController);

/**
 * 📌 Marcar notificación global como leída por usuario
 * PUT /api/notifications/global/:id/read
 */
router.put('/global/:id/read', verifyToken, markGlobalNotificationReadController);

/**
 * 📌 Eliminar notificación por ID
 * DELETE /api/notifications/:id
 */
router.delete('/:id', verifyToken, deleteNotificationController);

export default router;
