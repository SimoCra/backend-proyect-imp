// src/models/Category.js
import db from "../config/db.js";

// Obtener todas las categorías
export const getAllCategories = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM categories`;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Crear nueva categoría
export const createCategory = (code,name, image) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO categories (id,name, image) VALUES (?, ?, ?)`;
    db.query(query, [code, name, image], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name, image });
    });
  });
};


// Actualizar categoría
export const updateCategory = (id, name, image) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE categories SET name = ?, image = ? WHERE id = ?`;
    db.query(query, [name, image, id], (err, result) => {
      if (err) return reject(err);
      resolve({ message: "Categoría actualizada" });
    });
  });
};

// Eliminar categoría
export const deleteCategory = (id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM categories WHERE id = ?`;
    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      resolve({ message: "Categoría eliminada" });
    });
  });
};

// Obtener productos por categoría
export const getProductsByCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.*,
        (SELECT pv.image_url FROM product_variants pv WHERE pv.product_id = p.id LIMIT 1) AS image_url
      FROM products p
      WHERE p.category_id = ?
    `;
    db.query(query, [categoryId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};





// ---------------------------------------------------------

// Products up

// Obtener un producto por ID con sus variantes
export const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    // Consulta para obtener el producto
    const productQuery = `SELECT * FROM products WHERE id = ?`;

    db.query(productQuery, [id], (err, productResults) => {
      if (err) return reject(err);
      if (productResults.length === 0) return resolve(null);

      const product = productResults[0];

      // Obtener variantes del producto
      const variantsQuery = `SELECT * FROM product_variants WHERE product_id = ?`;

      db.query(variantsQuery, [id], (err, variantsResults) => {
        if (err) return reject(err);

        // Adjuntar variantes al producto
        product.variants = variantsResults || [];

        resolve(product);
      });
    });
  });
};

export const updateProduct = (id, category_id, name, description, price, stock) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE products 
      SET category_id = ?, 
          name = ?, 
          description = ?, 
          price = ?, 
          stock = ?
      WHERE id = ?
    `;

    const values = [category_id, name, description, price, stock, id];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);

      if (result.affectedRows === 0) {
        return resolve(null); // no se encontró el producto
      }

      // Retornamos el producto actualizado (lo que se mandó al update)
      resolve({ id, category_id, name, description, price, stock });
    });
  });
};

export const updateProductVariant = (product_id, variant_id, color, style, price, image_url) => {
  return new Promise((resolve, reject) => {
    if (!variant_id) return reject(new Error("El ID de la variante es obligatorio"));

    // Primero obtenemos la variante actual por variant_id y product_id
    const selectQuery = `
      SELECT image_url 
      FROM product_variants 
      WHERE id = ? AND product_id = ? 
      LIMIT 1
    `;

    db.query(selectQuery, [variant_id, product_id], (selectErr, results) => {
      if (selectErr) return reject(selectErr);

      if (results.length === 0) {
        return resolve(null); // no existe la variante para ese producto
      }

      // Si no se pasó image_url, usamos el actual
      const finalImageUrl = image_url || results[0].image_url;

      const updateQuery = `
        UPDATE product_variants
        SET color = ?,
            style = ?,
            price = ?,
            image_url = ?
        WHERE id = ? AND product_id = ?
      `;

      const values = [color, style, price, finalImageUrl, variant_id, product_id];

      db.query(updateQuery, values, (updateErr, result) => {
        if (updateErr) return reject(updateErr);

        if (result.affectedRows === 0) {
          return resolve(null);
        }

        resolve({ id: variant_id, product_id, color, style, price, image_url: finalImageUrl });
      });
    });
  });
};





// Eliminar producto (y sus variantes por ON DELETE CASCADE)
export const deleteProduct = (id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM products WHERE id = ?`;
    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      resolve({ message: "Producto eliminado correctamente" });
    });
  });
};




export const getCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM categories WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};


export const getVariantsByProduct = (productId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM product_variants
      WHERE product_id = ?`;
    db.query(query, [productId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


// models/productVariantModel.js (o donde tengas tus queries de variantes)
export const getProductVariantById = (variantId, productId) => {
  return new Promise((resolve, reject) => {
    if (!variantId) return reject(new Error("El ID de la variante es obligatorio"));
    if (!productId) return reject(new Error("El ID del producto es obligatorio"));

    const query = `
      SELECT *
      FROM product_variants
      WHERE id = ? AND product_id = ?
      LIMIT 1
    `;

    db.query(query, [variantId, productId], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null); // no existe la variante para ese producto
      }

      resolve(results[0]);
    });
  });
};

