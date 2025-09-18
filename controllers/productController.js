import { createProduct, getProducts, getProductByName,createProductVariants,
  removeProductVariantById,
  getVariantsByProductId} from '../service/productService.js';
import { countAllProducts } from '../models/productModel.js';

// POST /admin/create-product
export const createProductController = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }

  const { id, name, description, price, stock, category, variants } = req.body;

  // Validar campos obligatorios básicos
  if (!id || !name || !description || !price || stock === undefined || !category) {
    return res.status(400).json({ message: 'Llene todos los campos obligatorios' });
  }

  // Validar que variantes existan y sean JSON (puede venir como string)
  let parsedVariants;
  try {
    parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
  } catch (err) {
    return res.status(400).json({ message: 'Formato de variantes inválido' });
  }

  if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
    return res.status(400).json({ message: 'Debe enviar al menos una variante' });
  }

  // Convertir el stock a entero 1 o 0 para la tabla products
  const stockBool = stock === 'true' || stock === '1' || stock === 1 || stock === true ? 1 : 0;

  // Validar que la cantidad de imágenes coincida con variantes
  if (req.files.length !== parsedVariants.length) {
    return res.status(400).json({ message: 'La cantidad de imágenes debe coincidir con la cantidad de variantes' });
  }

  // Mapear variantes agregando la url de la imagen subida, sin stock en variantes
  const variantsWithImages = parsedVariants.map((variant, index) => ({
    color: variant.color,
    style: variant.style,
    price: parseInt(variant.price),
    image_url: `uploads/products/${req.files[index].filename}`
  }));

  try {
    await createProduct(id, category, name, description, price, stockBool, variantsWithImages);
    return res.status(201).json({ message: 'Producto creado exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.toString() || 'Error al crear el producto' });
  }
};



// GET /home/get-products-public
export const getPublicProductsController = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const offset = (pageInt - 1) * limitInt;

    const [products, total] = await Promise.all([
      getProducts(limitInt, offset),   // ✅ ya incluye variantes con imagen_url
      countAllProducts()
    ]);

    const totalPages = Math.ceil(total / limitInt);

    res.status(200).json({
      products,
      pagination: {
        total,
        page: pageInt,
        limit: limitInt,
        totalPages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error al obtener productos' });
  }
};

// GET /home/get-product/:name
export const getProductByNameController = async (req, res) => {
  try {
    const product = await getProductByName(req.params.name);  // ✅ ya incluye variants con imagen_url
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error });
  }
};


// controllers/variantController.j

// Controller para crear variantes de un producto
export const createProductVariantsController = async (req, res) => {
  try {
    const { productId, color, style, price, variantId } = req.body;
    const imageFile = req.file; // multer

    if (!productId) return res.status(400).json({ message: "El ID del producto es obligatorio" });
    if (!color || !style || !price) return res.status(400).json({ message: "Color, estilo y precio son obligatorios" });

    // Construimos la URL que vamos a guardar en la BD
    let image_url = null;
    if (imageFile) {
      image_url = `uploads/products/${imageFile.filename}`; // path relativo o absoluto
    }

    const variantData = {
      variantId,
      color,
      style,
      price,
      image_url // ✅ esto sí se insertará en la BD
    };

    const createdVariant = await createProductVariants(productId, [variantData]);

    return res.status(201).json({
      message: "Variante creada exitosamente",
      productId,
      variant: createdVariant
    });

  } catch (error) {
    console.error("Error en createProductVariantsController:", error.message);
    return res.status(500).json({
      message: "Error al crear la variante del producto",
      error: error.message
    });
  }
};


// Controller para eliminar una variante
export const removeProductVariantController = async (req, res) => {
  const { variantId } = req.params;

  if (!variantId) {
    return res.status(400).json({ message: 'variantId es obligatorio' });
  }

  try {
    const result = await removeProductVariantById(variantId);
    return res.status(200).json({
      message: 'Variante eliminada exitosamente',
      variantId: result.variantId,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: error.toString() || 'Variante no encontrada' });
  }
};

// Controller para obtener variantes de un producto
export const getProductVariantsController = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: 'productId es obligatorio' });
  }

  try {
    const variants = await getVariantsByProductId(productId);
    return res.status(200).json({ productId, variants });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener variantes' });
  }
};
