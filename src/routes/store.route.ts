import { Router } from "express";
import { getAllStores, getStoreById } from "../controllers/store.controller";

const router = Router();

router.get("/", getAllStores);
router.get("/:storeId", getStoreById);

export default router;
