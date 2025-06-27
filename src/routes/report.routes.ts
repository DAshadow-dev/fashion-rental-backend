import { RequestHandler, Router } from "express";
import { createReport, getAllReports, getReportsByTargetId } from "../controllers/report.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

router.get("/target/:userId",  authMiddleware as RequestHandler, getReportsByTargetId);
router.get("/", authMiddleware as RequestHandler, getAllReports); 
router.post("/", authMiddleware as RequestHandler, createReport);


export default router;