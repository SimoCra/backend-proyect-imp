import { 
  getNotificationsByUserId, 
  deleteNotificationById, 
  insertGlobalNotification, 
  markGlobalNotificationAsReadByUser 
} from "../models/notificationsModel.js";

// =========================================
// 📌 Obtener notificaciones por userId y rol
// =========================================
export const fetchNotifications = async (userId, role) => {
  try {
    const notifications = await getNotificationsByUserId(userId, role);
    return notifications;
  } catch (err) {
    console.error('❌ Error en fetchNotifications:', err);
    throw new Error('Error al obtener las notificaciones');
  }
};

// =========================================
// 📌 Eliminar notificación por ID
// =========================================
export const removeNotification = async (notificationId) => {
  try {
    const affectedRows = await deleteNotificationById(notificationId);
    if (affectedRows === 0) {
      throw new Error('Notificación no encontrada o ya eliminada');
    }
    return { success: true };
  } catch (err) {
    console.error('❌ Error en removeNotification:', err);
    throw new Error('Error al eliminar la notificación');
  }
};

// =========================================
// 📌 Crear notificación global (para admins, etc.)
// =========================================
export const createGlobalNotification = async (title, message, type, targetRole = 'all') => {
  try {
    const insertId = await insertGlobalNotification(title, message, type, targetRole);
    return { success: true, id: insertId };
  } catch (error) {
    console.error('❌ Error en createGlobalNotification:', error);
    throw new Error('Error al crear la notificación global');
  }
};

// =========================================
// 📌 Marcar notificación global como leída por usuario
// =========================================
export const markGlobalAsRead = async (notificationId, userId) => {
  try {
    await markGlobalNotificationAsReadByUser(notificationId, userId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error en markGlobalAsRead:', error);
    throw new Error('Error al marcar notificación global como leída');
  }
};
