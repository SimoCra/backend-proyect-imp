import db from '../config/db.js';

/**
 * Crear una solicitud de contacto
 */
export const insertContactRequest = ({ name, email, subject, message }) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO contact_requests (name, email, subject, message, created_at, status)
      VALUES (?, ?, ?, ?, NOW(), 'pendiente')
    `;
    db.query(query, [name, email, subject, message], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};

/**
 * Obtener todas las solicitudes con paginación
 */
export const getAllContactRequests = (page = 1, limit = 20) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    const query = `
      SELECT id, name, email, subject, message, status, created_at
      FROM contact_requests
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, [limit, offset], (err, results) => {
      if (err) return reject(err);

      // Obtener total para calcular número de páginas
      db.query("SELECT COUNT(*) AS total FROM contact_requests", (err2, countResult) => {
        if (err2) return reject(err2);
        const total = countResult[0]?.total || 0;
        resolve({ data: results, total });
      });
    });
  });
};

/**
 * Actualizar estado de solicitud
 */
export const updateContactRequestStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE contact_requests
      SET status = ?
      WHERE id = ?
    `;
    db.query(query, [status, id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0); // true si se actualizó
    });
  });
};

/**
 * Eliminar una solicitud
 */
export const deleteContactRequest = (id) => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM contact_requests
      WHERE id = ?
    `;
    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0); // true si se eliminó
    });
  });
};


export const getContactRequestById = (id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT id, name, email, subject FROM contact_requests WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};