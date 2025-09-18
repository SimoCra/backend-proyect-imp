import {
  insertAddress,
  getAddressesByUserId,
  checkIfAddressExists,
  getAddressById as getAddressByIdModel,
  putAddressById,
  deleteAddressById
} from '../models/addressModel.js';

// Crear una nueva dirección
export const createAddress = async (addressData) => {
  const { user_id, direccion, tipo_domicilio, ciudad } = addressData;

  // ✅ Validaciones básicas
  if (!user_id || !direccion || !tipo_domicilio) {
    throw new Error('Faltan campos obligatorios');
  }

  // ✅ Verificar si ya existe la dirección
  const exists = await checkIfAddressExists(addressData);
  if (exists) {
    throw new Error('La dirección ya existe');
  }

  // ✅ Insertar nueva dirección
  const newAddressId = await insertAddress(addressData);

  return {
    message: 'Dirección creada',
    id: newAddressId,
  };
};

// Obtener todas las direcciones de un usuario
export const getUserAddresses = async (userId) => {
  if (!userId) {
    throw new Error('ID de usuario requerido');
  }
  return await getAddressesByUserId(userId);
};

// ✅ Obtener una dirección específica por su ID
export const getAddressById = async (addressId) => {
  if (!addressId) {
    throw new Error('El ID de la dirección es requerido');
  }

  return await getAddressByIdModel(addressId);
};

export const updateAddressById = async (addressData) => {
  if (!addressData?.id) {
    throw new Error("El ID de la dirección es requerido");
  }

  if (Object.keys(addressData).length === 1) {
    throw new Error("Los datos de la dirección son requeridos");
  }

  const updated = await putAddressById(addressData);

  if (!updated) {
    throw new Error("No se encontró la dirección o no se pudo actualizar");
  }

  return { success: true, message: "Dirección actualizada correctamente" };
};


export const deleteAddressByIdService = async (id) => {
  if (!id) {
    throw new Error("El ID de la dirección es requerido");
  }

  const deleted = await deleteAddressById(id);

  if (!deleted) {
    throw new Error("No se encontró la dirección o no se pudo eliminar");
  }

  return { success: true, message: "Dirección eliminada correctamente" };
};