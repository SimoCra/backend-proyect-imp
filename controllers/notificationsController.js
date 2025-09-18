// controllers/notificationController.js
import {
  fetchNotifications,
  removeNotification,
  createGlobalNotification,
  markGlobalAsRead
} from '../service/notificatonService.js';

import { markNotificationsAsReadByUser } from '../models/notificationsModel.js';

/**
 * 📌 Obtiene las últimas 10 notificaciones para el usuario autenticado
 */
export const getNotificationsController = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID es requerido' });
    }

    // Seguridad: validar que el usuario autenticado solo vea sus propias notificaciones
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'No autorizado para ver estas notificaciones' });
    }

    const notifications = await fetchNotifications(userId, req.user.role); // ✅ ahora pasa el rol
    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Error en getNotificationsController:', error);
    res.status(400).json({ message: error.message || 'Error al obtener notificaciones' });
  }
};

/**
 * 📌 Elimina una notificación por ID
 */
export const deleteNotificationController = async (req, res) => {
  try {
    const notificationId = req.params.id;
    if (!notificationId) {
      return res.status(400).json({ message: 'ID de notificación es requerido' });
    }

    // (Opcional: validar que la notificación pertenece al usuario o sea global)

    await removeNotification(notificationId);
    res.status(200).json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error en deleteNotificationController:', error);
    res.status(400).json({ message: error.message || 'Error al eliminar la notificación' });
  }
};

/**
 * 📌 Marca todas las notificaciones de un usuario como leídas
 */
export const markNotificationsReadController = async (req, res) => {
  const userIdFromParams = Number(req.params.userId);
  const authenticatedUserId = Number(req.user.id);

  if (userIdFromParams !== authenticatedUserId) {
    return res.status(403).json({ message: 'No autorizado para modificar estas notificaciones' });
  }

  try {
    await markNotificationsAsReadByUser(userIdFromParams);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error marcando notificaciones como leídas:', error);
    res.status(500).json({ message: 'Error marcando notificaciones como leídas' });
  }
};

/**
 * 📌 Marca una notificación global como leída por usuario
 */
export const markGlobalNotificationReadController = async (req, res) => {
  try {
    const { id } = req.params; // id de la noti global
    const userId = Number(req.user.id);

    if (!id || !userId) {
      return res.status(400).json({ message: 'ID de notificación y usuario son requeridos' });
    }

    await markGlobalAsRead(id, userId);

    res.status(200).json({ success: true, message: 'Notificación global marcada como leída' });
  } catch (error) {
    console.error('❌ Error en markGlobalNotificationReadController:', error);
    res.status(500).json({ message: 'Error al marcar notificación global como leída' });
  }
};

/**
 * 📌 Crea una notificación global
 */
export const createGlobalNotificationController = async (req, res) => {
  try {
    const { title, message, type, targetRole = 'all' } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: "Título, mensaje y tipo son requeridos",
      });
    }

    const result = await createGlobalNotification(title, message, type, targetRole);

    return res.status(201).json({
      success: true,
      message: "Notificación global creada con éxito",
      notificationId: result.id, // ✅ devuelve el id
    });
  } catch (error) {
    console.error("❌ Error en createGlobalNotificationController:", error);
    return res.status(500).json({
      success: false,
      message: "Error al crear la notificación global",
    });
  }
};
