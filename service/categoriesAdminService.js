import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductVariant,
  getProductVariantById
} from '../models/categoriesAdminModel.js';

import { uploadImage } from '../middleware/upload.js';
/**
 * Obtener todas las categorías con paginación
 */
export const getAllCategoriesService = async (limit = 20, offset = 0) => {
  try {
    return await getAllCategories(limit, offset);
  } catch (error) {
    console.error('Error al obtener categorías:', error.message);
    throw new Error('No se pudieron obtener las categorías');
  }
};

/**
 * Agregar nueva categoría con validación de duplicados
 */
export const addCategoryService = async (code, name, image) => {
  if (!code || code.trim() === '') {
    throw new Error('El código de la categoría es obligatorio');
  }
  if (!name || name.trim() === '') {
    throw new Error('El nombre de la categoría es obligatorio');
  }

  try {
    // Ya que createCategory ahora espera (name, image), 
    // y 'code' no se usa en la tabla, podrías renombrarlo o eliminarlo si no es necesario.
    return await createCategory(code, name.trim(), image || null);
  } catch (error) {
    console.error('Error al agregar categoría:', error.message);
    throw new Error(error.message || 'No se pudo agregar la categoría');
  }
};


/**
 * Actualizar categoría con validación de duplicados
 */
export const updateCategoryService = async (id, code, name, image) => {
  // Validaciones básicas para asegurar que se proporcionen los datos necesarios
  if (!id) throw new Error('El ID de la categoría es requerido');
  if (!code || code.trim() === '') throw new Error('El código es obligatorio');
  if (!name || name.trim() === '') throw new Error('El nombre es obligatorio');

  try {
    // Aquí podrías validar que 'image' sea un nombre de archivo válido, si hace falta
    // También podrías, en un futuro, controlar que no se repita el código o el nombre si son únicos

    return await updateCategory(id, name.trim(), image || null);
  } catch (error) {
    // Buena práctica: log del error para debugging, y se relanza un error genérico para el cliente
    console.error('Error al actualizar categoría:', error.message);
    throw new Error(error.message || 'No se pudo actualizar la categoría');
  }
};


/**
 * Eliminar categoría
 */
export const deleteCategoryService = async (id) => {
  if (!id) throw new Error('El ID de la categoría es requerido');

  try {
    return await deleteCategory(id);
  } catch (error) {
    console.error('Error al eliminar categoría:', error.message);
    throw new Error('No se pudo eliminar la categoría');
  }
};

/**
 * Obtener productos de una categoría específica
 */
export const getProductsByCategoryService = async (categoryId) => {
  if (!categoryId) throw new Error('El ID de la categoría es requerido');

  try {
    return await getProductsByCategory(categoryId);
  } catch (error) {
    console.error('Error al obtener productos de la categoría:', error.message);
    throw new Error('No se pudieron obtener los productos de la categoría');
  }
};


//  Products

export const getProductByIdService = async (id) => {
  if (!id) throw new Error('El ID del producto es requerido');

  try {
    const product = await getProductById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  } catch (error) {
    console.error('Error al obtener el producto:', error.message);
    throw new Error('No se pudo obtener el producto');
  }
};


export const updateProductService = async (id, category_id, name, description, price, stock) => {
  if (!id) throw new Error('El ID del producto es obligatorio');
  if (!category_id) throw new Error('La categoría es obligatoria');
  if (!name || name.trim() === '') throw new Error('El nombre es obligatorio');
  if (price == null || isNaN(price)) throw new Error('El precio debe ser un número');
  if (stock == null || isNaN(stock)) throw new Error('El stock debe ser un número');

  try {
    return await updateProduct(id, category_id, name.trim(), description || '', price, stock);
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    throw new Error(error.message || 'No se pudo actualizar el producto');
  }
};

export const updateProductVariantService = async (productId, variantData) => {
  // variantData = { variantId, color, style, price, imageFile, image_url }

  const { variantId, color, style, price, imageFile, image_url } = variantData;

  if (!productId) throw new Error('El ID del producto es obligatorio');
  if (!variantId) throw new Error('El ID de la variante es obligatorio');
  if (!color || color.trim() === '') throw new Error('El color es obligatorio');
  if (!style || style.trim() === '') throw new Error('El estilo es obligatorio');
  if (price == null || isNaN(price)) throw new Error('El precio debe ser un número');

  try {
    // Obtenemos la variante actual desde la BD
    const currentVariant = await getProductVariantById(variantId, productId);
    if (!currentVariant) throw new Error('La variante no existe');

    // Determinamos la URL final de la imagen:
    // 1. Si subieron un archivo -> subirlo y usarlo
    // 2. Si no, usar image_url si se pasó
    // 3. Si no, usar la imagen actual de la BD
    let finalImageUrl;
    if (imageFile) {
      finalImageUrl = await uploadImage(imageFile);
    } else if (image_url && image_url.trim() !== '') {
      finalImageUrl = image_url.trim();
    } else {
      finalImageUrl = currentVariant.image_url; // la que ya estaba en la BD
    }

    if (!finalImageUrl) throw new Error('No se pudo determinar la imagen de la variante');

    // Llamamos al modelo para actualizar la variante
    return await updateProductVariant(
      productId,
      variantId,
      color.trim(),
      style.trim(),
      price,
      finalImageUrl
    );

  } catch (error) {
    console.error('Error al actualizar variante de producto:', error.message);
    throw new Error(error.message || 'No se pudo actualizar la variante del producto');
  }
};




export const deleteProductService = async (id) => {
  if (!id) throw new Error('El ID del producto es requerido');

  try {
    const result = await deleteProduct(id);
    return result;
  } catch (error) {
    console.error('Error al eliminar el producto:', error.message);
    throw new Error('No se pudo eliminar el producto');
  }
};

