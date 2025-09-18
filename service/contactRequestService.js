import {
  insertContactRequest,
  getAllContactRequests,
  updateContactRequestStatus,
  deleteContactRequest,
} from "../models/contactRequestModel.js"; // tus queries van en models/contactRequestModel.js

// ✅ Crear una solicitud de contacto
export const createContactRequest = async ({ name, email, subject, message }) => {
  if (!name || !email || !subject || !message) {
    throw new Error("Todos los campos son obligatorios.");
  }

  const contactId = await insertContactRequest({ name, email, subject, message });

  return {
    id: contactId,
    name,
    email,
    subject,
    message,
    status: "pendiente",
    created_at: new Date(),
  };
};

// ✅ Obtener todas las solicitudes con paginación
export const fetchAllContactRequests = async (page = 1, limit = 20) => {
  const { data, total } = await getAllContactRequests(page, limit);

  return {
    data: Array.isArray(data)
      ? data.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          subject: row.subject,
          message: row.message,
          status: row.status,
          created_at: row.created_at,
        }))
      : [],
    total: typeof total === "number" ? total : 0,
  };
};

// ✅ Actualizar estado de la solicitud
export const setContactRequestStatus = async (id, status) => {
  const validStatuses = ["pendiente", "en_proceso", "resuelto"];

  if (!validStatuses.includes(status)) {
    throw new Error("Estado inválido");
  }

  const updated = await updateContactRequestStatus(id, status);
  if (!updated) throw new Error("No se pudo actualizar la solicitud");

  return { id, status };
};

// ✅ Eliminar solicitud
export const removeContactRequest = async (id) => {
  const deleted = await deleteContactRequest(id);
  if (!deleted) throw new Error("Solicitud no encontrada");

  return { id, deleted: true };
};
