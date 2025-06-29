import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import mongoose from "mongoose";
import { AuthRequest } from "../types/request.type";

// Tạo hoặc lấy conversation giữa 2 user (customer, store)
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { userId1, userId2 } = req.body;
    if (!userId1 || !userId2)
      return res.status(400).json({ message: "Missing user ids" });
    let conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2], $size: 2 },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId1, userId2],
      });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Lấy tất cả conversation của 1 user
export const getUserConversations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "_id username role storeInfo avatar")
      .populate({ path: "lastMessage", model: "Message" })
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Lấy tin nhắn của 1 conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "_id username role storeInfo avatar")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Gửi tin nhắn (qua API, fallback nếu socket lỗi)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, content } = req.body;
    if (!conversationId || !senderId || !content)
      return res.status(400).json({ message: "Missing fields" });
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
