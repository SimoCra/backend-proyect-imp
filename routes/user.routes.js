import express from 'express';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import {
  getAdminUsersController,
  getUserInfoController,
  updateUserController,
  deleteUserController
} from '../controllers/userController.js';
import {uploadImageController, updateImageController, deleteImageController, getUserImagesController} from '../controllers/userController.js'
import { upload, validarFirmaHex } from "../middleware/upload.js";
import { adminSecurityMiddleware } from '../middleware/securityLogger.js';

const router = express.Router();

// GET /admin
router.get('/admin', verifyToken, adminSecurityMiddleware, checkRole(['admin']), getAdminUsersController);

// GET /user
router.get('/user', verifyToken, getUserInfoController);

// PUT /:id
router.put('/:id', verifyToken,updateUserController);

// DELETE /admin/users/:id
router.delete('/admin/users/:id', verifyToken,  checkRole(['admin']), deleteUserController);


// IMAGES

router.post("/images-user/:id", upload.single("image"), validarFirmaHex, uploadImageController);

// Actualizar imagen
router.put("/images-user/:id", upload.single("image"), validarFirmaHex, updateImageController);

// Eliminar imagen
router.delete("/images-user/:id", deleteImageController);

// Listar imágenes de un usuario
router.get("/images-user/:id", getUserImagesController);

export default router;
