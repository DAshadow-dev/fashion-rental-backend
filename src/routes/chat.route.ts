import express, { RequestHandler } from "express";
import {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Tạo hoặc lấy conversation giữa 2 user
router.post("/conversation", (req, res) => {
  getOrCreateConversation(req, res).catch((err) => {
    res.status(500).json({ error: err.message || "Internal server error" });
  });
});

// Lấy tất cả conversation của 1 user (theo userId)
router.get(
  "/conversations/:userId",
  authMiddleware as RequestHandler,
  getUserConversations
);

// Lấy tin nhắn của 1 conversation
router.get("/messages/:conversationId", getMessages);

// Gửi tin nhắn (qua API, fallback nếu socket lỗi)
router.post("/message", (req, res) => {
  sendMessage(req, res).catch((err) => {
    res.status(500).json({ error: err.message || "Internal server error" });
  });
});

export default router;
