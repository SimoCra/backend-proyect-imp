// models/addressModel.js
import db from '../config/db.js';

export const insertAddress = (addressData) => {
  return new Promise((resolve, reject) => {
    const {
      user_id,
      direccion,
      departamento,
      ciudad,
      barrio,
      apartamento,
      indicaciones,
      tipo_domicilio,
      nombre_contacto,
      celular_contacto
    } = addressData;

    const query = `
      INSERT INTO addresses (
        user_id, direccion, departamento, ciudad, barrio,
        apartamento, indicaciones, tipo_domicilio,
        nombre_contacto, celular_contacto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_id,
      direccion,
      departamento,
      ciudad,
      barrio,
      apartamento,
      indicaciones,
      tipo_domicilio,
      nombre_contacto,
      celular_contacto
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};

export const getAddressesByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM addresses
      WHERE user_id = ?
      ORDER BY created_at DESC;
    `;

    db.query(query, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};


// models/addressModel.js (ejemplo)
export const checkIfAddressExists = (addressData) => {
  return new Promise((resolve, reject) => {
    const { user_id, direccion, ciudad, tipo_domicilio } = addressData;

    const query = `
      SELECT id FROM addresses 
      WHERE user_id = ? AND direccion = ? AND ciudad = ? AND tipo_domicilio = ?
      LIMIT 1
    `;

    db.query(query, [user_id, direccion, ciudad, tipo_domicilio], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0); // true si ya existe
    });
  });
};


export const getAddressById = (addressId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM addresses
      WHERE id = ?
      LIMIT 1;
    `;

    db.query(query, [addressId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error("Dirección no encontrada"));
      resolve(results[0]); 
    });
  });
};


export const putAddressById = (addressData) => {
  return new Promise((resolve, reject) => {
    const {
      id,
      direccion,
      departamento,
      ciudad,
      barrio,
      apartamento,
      indicaciones,
      tipo_domicilio,
      nombre_contacto,
      celular_contacto,
    } = addressData;

    if (!id) {
      return reject(new Error("El ID de la dirección es requerido"));
    }

    const query = `
      UPDATE addresses
      SET direccion = ?, 
          departamento = ?, 
          ciudad = ?, 
          barrio = ?, 
          apartamento = ?, 
          indicaciones = ?, 
          tipo_domicilio = ?, 
          nombre_contacto = ?, 
          celular_contacto = ?
      WHERE id = ?
    `;

    const values = [
      direccion,
      departamento,
      ciudad,
      barrio,
      apartamento,
      indicaciones,
      tipo_domicilio,
      nombre_contacto,
      celular_contacto,
      id,
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0); // true si se actualizó algo
    });
  });
};


export const deleteAddressById = (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error("El ID de la dirección es requerido"));
    }

    const query = `
      DELETE FROM addresses
      WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0); // true si se eliminó algo
    });
  });
};
