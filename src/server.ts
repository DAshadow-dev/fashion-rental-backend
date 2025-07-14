import app from "./app";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import seedDatabase from "./utils/seed";
import RentalScheduleService from "./services/rental.service";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import Conversation from "./models/conversation.model";
import Message from "./models/message.model";

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Cấu hình lại cho production nếu cần
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // Nhận roomId (conversationId) để join vào room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Nhận tin nhắn mới từ client
  socket.on("send_message", async (data) => {
    const { conversationId, senderId, content } = data;
    if (!conversationId || !senderId || !content) return;
    try {
      // Lưu message vào DB
      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        content,
      });
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date(),
      });
      // Emit tin nhắn mới tới tất cả client trong room (conversation)
      io.to(conversationId).emit("receive_message", {
        _id: message._id,
        conversation: conversationId,
        sender: senderId,
        content,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });
    } catch (err) {
      console.error("Socket message error:", err);
    }
  });
});

connectDB().then(() => {
  // Initialize scheduled jobs for auto rental processing
  RentalScheduleService.initScheduledJobs();
  
  // seedDatabase();
  if (process.env.NODE_ENV === "development") {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Rental auto-processing enabled`);
    });
  } else {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Rental auto-processing enabled`);
    });
  }
});
