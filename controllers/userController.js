import { showUsers, deleteUser, editUsers } from '../service/userService.js';
import { getAllUsersWithImages } from '../models/userModel.js';

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
