import {
  getAllCategoriesService,
  addCategoryService,
  updateCategoryService,
  deleteCategoryService,
  getProductsByCategoryService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  updateProductVariantService
} from '../service/categoriesAdminService.js';
import { replaceImage } from '../utils/replaceImage.js';
import { getCategoryById } from '../models/categoriesAdminModel.js'; 
/**
 * Obtener todas las categorías con paginación
 */
export const getAllCategoriesController = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const categories = await getAllCategoriesService(Number(limit), Number(offset));

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener categorías',
    });
  }
};

/**
 * Crear una nueva categoría (con imagen opcional)
 */
export const addCategoryController = async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'El código y el nombre de la categoría son obligatorios',
      });
    }

    // validar que el código tenga exactamente 3 caracteres
    if (code.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'El código debe tener exactamente 3 caracteres (ej: 003, 010)',
      });
    }

    const image = req.file ? req.file.path : null;

    const newCategory = await addCategoryService(code, name, image);

    return res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Categoría creada exitosamente',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Error al crear categoría',
    });
  }
};

/**
 * Actualizar una categoría (nombre + imagen opcional)
 */
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;
    if (!id || !code || !name) {
      return res.status(400).json({ success: false, message: 'ID, código y nombre son obligatorios' });
    }

    const newImage = req.file ? req.file.path : null;
    const existingCategory = await getCategoryById(id);

    if (!existingCategory) {
      if (newImage) fs.unlinkSync(path.resolve(newImage)); // Eliminar imagen nueva que no se usará
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    // Aquí llamas a replaceImage para eliminar la antigua solo si hay nueva
    if (newImage) replaceImage(newImage, existingCategory.image);

    const updatedCategory = await updateCategoryService(id, code.trim(), name.trim(), newImage);

    return res.status(200).json({
      success: true,
      data: updatedCategory,
      message: 'Categoría actualizada exitosamente',
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message || 'Error al actualizar categoría' });
  }
};


/**
 * Eliminar una categoría
 */
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la categoría es obligatorio',
      });
    }

    const deleted = await deleteCategoryService(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Error al eliminar categoría',
    });
  }
};

/**
 * Obtener productos de una categoría
 */
export const getProductsByCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la categoría es obligatorio',
      });
    }

    const products = await getProductsByCategoryService(id);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener productos de la categoría',
    });
  }
};


// Products

export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del producto es obligatorio',
      });
    }

    const product = await getProductByIdService(id);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener el producto',
    });
  }
};


export const updateProductController = async (req, res) => {
  const { id } = req.params;
  const { category_id, name, description, price, stock } = req.body;

  try {
    const updatedProduct = await updateProductService(id, category_id, name, description, price, stock);

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProductVariantController = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId, color, style, price } = req.body;
    const imageFile = req.file; // multer

    if (!productId) {
      return res.status(400).json({ message: "El ID del producto es obligatorio" });
    }
    if (!variantId) {
      return res.status(400).json({ message: "El ID de la variante es obligatorio" });
    }

    // Llamamos al service que se encarga de manejar la lógica de imagen
    const updatedVariant = await updateProductVariantService(productId, {
      variantId,
      color,
      style,
      price,
      imageFile
    });

    if (!updatedVariant) {
      return res.status(404).json({ message: "Variante no encontrada para este producto" });
    }

    return res.status(200).json({
      message: "Variante de producto actualizada correctamente",
      variant: updatedVariant
    });

  } catch (error) {
    console.error("Error en updateProductVariantController:", error.message);
    return res.status(500).json({
      message: "Error al actualizar la variante del producto",
      error: error.message
    });
  }
};






export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del producto es obligatorio',
      });
    }

    const result = await deleteProductService(id);

    return res.status(200).json({
      success: true,
      message: result.message || 'Producto eliminado correctamente',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar el producto',
    });
  }
};
