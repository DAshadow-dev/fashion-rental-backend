import { Router } from "express";
import { getAllProducts, getProductOfStore, updateProduct, deleteProduct, createProduct, getProductById } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RequestHandler } from "express";
const router = Router();

router.get("/", authMiddleware as RequestHandler ,getAllProducts);
router.get("/store/:storeId", authMiddleware as RequestHandler,getProductOfStore);
router.get("/:productId", authMiddleware as RequestHandler,getProductById);
router.put("/:id", authMiddleware as RequestHandler,updateProduct);
router.delete("/:id", authMiddleware as RequestHandler ,deleteProduct);
router.post("/", authMiddleware as RequestHandler,createProduct);

export default router;
