import { Router } from "express";
import { getAllProducts, getProductOfStore, updateProduct, deleteProduct, createProduct } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RequestHandler } from "express";
const router = Router();

router.get("/", authMiddleware as RequestHandler ,getAllProducts);
router.get("/:id", authMiddleware as RequestHandler,getProductOfStore);
router.put("/:id", authMiddleware as RequestHandler,updateProduct);
router.delete("/:id", authMiddleware as RequestHandler ,deleteProduct);
router.post("/", authMiddleware as RequestHandler,createProduct);

export default router;
