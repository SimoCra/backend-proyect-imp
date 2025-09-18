// routes/contactRoutes.js
import express from "express";
import {
  createContactRequestController,
  getAllContactRequestsController,
  updateContactRequestStatusController,
  deleteContactRequestController,
} from "../controllers/contactRequestController.js";

import { validateContactRequest } from "../middleware/validateContact.js";

import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Crear solicitud de contacto (público, no requiere autenticación)
 * POST /api/contacts
 */
router.post("/",validateContactRequest, createContactRequestController);

/**
 * Obtener todas las solicitudes (solo admin)
 * GET /api/contacts
 */
router.get("/", verifyToken, checkRole(["admin"]), getAllContactRequestsController);
/**
 * Actualizar estado de la solicitud (solo admin)
 * PUT /api/contacts/:id/status
 */
router.put("/:id/status", verifyToken, checkRole(["admin"]), updateContactRequestStatusController);

/**
 * Eliminar solicitud (solo admin)
 * DELETE /api/contacts/:id
 */
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteContactRequestController);

export default router;
