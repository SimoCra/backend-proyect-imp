import {
  createContactRequest,
  fetchAllContactRequests,
  setContactRequestStatus,
  removeContactRequest,
} from "../service/contactRequestService.js";

import { getContactRequestById } from "../models/contactRequestModel.js";
import { sendContactRequestInProcessEmail } from "../utils/sendCode.js";

/**
 * 📩 Crear una nueva solicitud de contacto
 */
export const createContactRequestController = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const newRequest = await createContactRequest({ name, email, subject, message });
    res.status(201).json({
      message: "Solicitud de contacto creada correctamente",
      request: newRequest,
    });
  } catch (error) {
    console.error("❌ Error en createContactRequestController:", error);
    res.status(400).json({ message: error.message || "Error al crear solicitud de contacto" });
  }
};

/**
 * 📋 Obtener todas las solicitudes de contacto (solo admin) con paginación
 */
export const getAllContactRequestsController = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No autorizado para ver todas las solicitudes" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { data, total } = await fetchAllContactRequests(page, limit);

    res.status(200).json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ Error en getAllContactRequestsController:", error);
    res.status(400).json({ message: error.message || "Error al obtener solicitudes" });
  }
};

/**
 Actualizar el estado de una solicitud
 */
export const updateContactRequestStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "ID y nuevo estado son requeridos" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const updated = await setContactRequestStatus(id, status);

    const contactRequest = await getContactRequestById(id);

    if (!contactRequest) {
      return res.status(404).json({ message: "Solicitud de contacto no encontrada" });
    }


    if (status === "en_proceso") {
      await sendContactRequestInProcessEmail(
        contactRequest.email,
        contactRequest.name,
        contactRequest.subject
      );
    }

    res.status(200).json({
      message: "Estado de la solicitud actualizado correctamente",
      updated,
    });
  } catch (error) {
    console.error("❌ Error en updateContactRequestStatusController:", error);
    res.status(400).json({ message: error.message || "Error al actualizar estado" });
  }
};

/**
  Eliminar una solicitud de contacto
 */
export const deleteContactRequestController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID de solicitud es requerido" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "No autorizado" });

    await removeContactRequest(id);
    res.status(200).json({ message: "Solicitud eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error en deleteContactRequestController:", error);
    res.status(400).json({ message: error.message || "Error al eliminar solicitud" });
  }
};
