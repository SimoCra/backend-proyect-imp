import db from '../config/db.js';

// =========================================
// 📌 INSERTAR NOTIFICACIONES
// =========================================

// Notificación individual (para un usuario específico)
export const insertNotification = ({ user_id, title, message, is_global = false, type, target_role = 'all' }) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO notifications (user_id, title, message, is_global, type, target_role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    db.query(query, [user_id, title, message, is_global, type, target_role], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};

// Notificación global (ej: broadcast o solo admin)
export const insertGlobalNotification = (title, message, type, target_role = 'all') => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO notifications (user_id, title, message, is_global, type, target_role, created_at)
      VALUES (NULL, ?, ?, TRUE, ?, ?, NOW())
    `;
    db.query(query, [title, message, type, target_role], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};

// =========================================
// 📌 OBTENER NOTIFICACIONES POR USUARIO
// =========================================
export const getNotificationsByUserId = (userId, role) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.is_global,
        n.type,
        n.target_role,
        n.created_at,
        CASE 
          WHEN n.is_global = 1 
            THEN CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END
          ELSE n.is_read
        END AS is_read
      FROM notifications n
      LEFT JOIN notification_reads r
        ON n.id = r.notification_id AND r.user_id = ?
      WHERE 
        (n.is_global = 1 AND (n.target_role = 'all' OR n.target_role = ?))
        OR n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 10
    `;

    db.query(query, [userId, role, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// =========================================
// 📌 ELIMINAR NOTIFICACIÓN
// =========================================
export const deleteNotificationById = (notificationId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM notifications WHERE id = ?`;

    db.query(query, [notificationId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
};

// =========================================
// 📌 MARCAR COMO LEÍDA (INDIVIDUAL)
// =========================================
export const markNotificationsAsReadByUser = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
    `;

    db.query(query, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
};

// =========================================
// 📌 MARCAR NOTIFICACIÓN GLOBAL COMO LEÍDA POR USUARIO
// =========================================
export const markGlobalNotificationAsReadByUser = (notificationId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO notification_reads (notification_id, user_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
    `;
    db.query(query, [notificationId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId || result.affectedRows);
    });
  });
};
