import { 
  addProductReview,
  fetchProductAverageRating,
  deleteReviewService,
  fetchProductReviews
} from "../service/productReviewService.js";


// 📌 Crear reseña
export const createReviewController = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const user_id = req.user?.id;

  if (!product_id || !user_id || !rating) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    await addProductReview(product_id, user_id, rating, comment);
    res.status(201).json({ message: "Reseña creada exitosamente" });
  } catch (error) {
    console.error("❌ Error creando reseña:", error);
    res.status(500).json({ message: "Error al crear la reseña" });
  }
};


// 📌 Obtener reseñas de un producto (con paginación)
export const getReviewsByProductController = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!productId) {
    return res.status(400).json({ message: "Falta el ID del producto" });
  }

  try {
    const { reviews, total } = await fetchProductReviews(
      productId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      reviews,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error("❌ Error obteniendo reseñas:", error);
    res.status(500).json({ message: "Error al obtener reseñas" });
  }
};


// 📌 Eliminar reseña (autor o admin)
export const deleteReviewController = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.id;
  const isAdmin = req.user?.role === "admin";

  if (!id) {
    return res.status(400).json({ message: "Falta el ID de la reseña" });
  }

  try {
    const result = await deleteReviewService(id, user_id, isAdmin);

    if (!result) {
      return res
        .status(403)
        .json({ message: "No autorizado para eliminar esta reseña" });
    }

    res.status(200).json({ message: "Reseña eliminada correctamente" });

  } catch (error) {
    console.error("❌ Error eliminando reseña:", error);
    res.status(500).json({ message: "Error al eliminar reseña" });
  }
};


// 📌 Obtener promedio de calificación de un producto
export const getProductAverageRatingController = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: "Falta el ID del producto" });
  }

  try {
    const stats = await fetchProductAverageRating(productId);
    res.status(200).json(stats); // { averageRating, totalReviews }
  } catch (error) {
    console.error("❌ Error obteniendo promedio de reseñas:", error);
    res.status(500).json({ message: "Error al obtener promedio de reseñas" });
  }
};
