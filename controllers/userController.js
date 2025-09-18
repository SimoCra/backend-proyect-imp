import { showUsers, deleteUser, editUsers } from '../service/userService.js';
import { getAllUsersWithImages } from '../models/userModel.js';
import { createImage, editImage, removeImage, listImagesByUser } from '../service/userService.js';
// GET /admin
export const getAdminUsersController = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;   // página (default 1)
    let limit = parseInt(req.query.limit) || 25; // usuarios por página (default 25)
    let offset = (page - 1) * limit;

    const users = await getAllUsersWithImages(limit, offset);

    res.json({
      page,
      limit,
      users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    res.status(500).json({ message: '❌ Error al obtener usuarios' });
  }
};


// GET /user
export const getUserInfoController = (req, res) => {
  res.status(200).json({ message: '✅ Bienvenido user', user: req.user });
};


// PUT /:id
export const updateUserController = async (req, res) => {
  const userId = req.params.id;
  const { email, name, phone } = req.body;

  try {
    await editUsers(userId, email, name, phone);
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar usuario', error });
  }
};


// DELETE /admin/users/:id
export const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await deleteUser(userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: '✅ Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error.message);
    res.status(500).json({ message: '❌ Error al eliminar usuario' });
  }
};


// Images

/**
 * Subir imagen para un usuario
 */
export const uploadImageController = async (req, res) => {
  const { id } = req.params; 
  const file = req.file;
  try {
    await createImage(id, file);
    res.status(201).json({ message: "✅ Imagen subida exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error || "Error al subir imagen" });
    console.error("❌ Error en uploadImageController:", error);
  }
};

/**
 * Actualizar imagen existente
 */
export const updateImageController = async (req, res) => {
  const { id } = req.params; 
  const file = req.file;

  try {
    await editImage(id, file);
    res.status(200).json({ message: "✅ Imagen actualizada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error || "Error al actualizar imagen" });
    console.error("❌ Error en updateImageController:", error);
  }
};

/**
 * Eliminar imagen
 */
export const deleteImageController = async (req, res) => {
  const { id } = req.params;

  try {
    await removeImage(id);
    res.status(200).json({ message: "✅ Imagen eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error || "Error al eliminar imagen" });
    console.error("❌ Error en deleteImageController:", error);
  }
};

/**
 * Listar imágenes de un usuario
 */
export const getUserImagesController = async (req, res) => {
  const { id } = req.params; 

  try {
    const images = await listImagesByUser(id);
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error || "Error al obtener imágenes" });
    console.error("❌ Error en getUserImagesController:", error);
  }
};