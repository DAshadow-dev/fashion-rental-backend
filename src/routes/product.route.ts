import { Router } from "express";
import {
  getAllProducts,
  getProductOfStore,
  updateProduct,
  deleteProduct,
  createProduct,
  getProductById,
  getUnavailableDates,
} from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RequestHandler } from "express";
import { upload } from "../config/cloudinary";

const router = Router();

// Configure upload middleware
const uploadMiddleware = upload.single("product");
// Product routes
router.get("/", getAllProducts);
router.get("/store/:storeId", getProductOfStore);
router.get("/:productId", getProductById);
router.put("/:id",authMiddleware as RequestHandler,updateProduct);
router.delete("/:id",authMiddleware as RequestHandler, deleteProduct);
router.post(
  "/",
  authMiddleware as RequestHandler,
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: "Error uploading file",
          error: err.message,
        });
      }
      next();
    });
  },
  createProduct
);
router.get("/:productId/unavailable-dates", getUnavailableDates);

export default router;
