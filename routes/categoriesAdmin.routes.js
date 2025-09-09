import { Router } from "express";
import {
  getAllCategoriesController,
  addCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getProductsByCategoryController,
  getProductByIdController,
  deleteProductController,
  updateProductController,
  updateProductVariantController
} from "../controllers/categoriesAdminController.js";
import { checkRole, verifyToken } from "../middleware/authMiddleware.js";

import { upload, validarFirmaHex } from "../middleware/upload.js";

const router = Router();

// Categorías
router.get("/", verifyToken, checkRole(['admin']),getAllCategoriesController);

router.post("/", verifyToken, checkRole(['admin']),upload.single("image"), validarFirmaHex, addCategoryController);

router.put("/:id", verifyToken, checkRole(['admin']),upload.single("image"), validarFirmaHex, updateCategoryController);

router.delete("/:id", verifyToken, checkRole(['admin']),deleteCategoryController);

router.get("/:id/products", verifyToken, checkRole(['admin']),getProductsByCategoryController);

// Productos
router.get("/product/:id", verifyToken, checkRole(['admin']),getProductByIdController);

router.put("/product/:id",verifyToken, checkRole(['admin']), updateProductController);

router.put('/product/variants/:productId',upload.single("imageFile"), verifyToken, checkRole(['admin']), updateProductVariantController);

router.delete("/product/:id",verifyToken, checkRole(['admin']), deleteProductController);

export default router;
