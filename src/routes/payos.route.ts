import express from "express";
import { payosWebhook } from "../controllers/payos.controller";

const router = express.Router();

router.post("/webhook", payosWebhook);

export default router;