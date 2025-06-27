import { AuthRequest } from "./../types/request.type";
import { Response } from "express";
import User from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/authUtils";

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({ role: "CUSTOMER" }, "-password");
    
    if (!users || users.length === 0) {
      res.status(404).json({ message: "No customers found" });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Failed to retrieve customers", error });
  }
};


export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res.status(400).json({ message: "Old and new password are required" });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid old password" });
      return;
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changeInfo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { phone, address } = req.body;
  if (!phone || !address) {
    res.status(400).json({ message: "Phone and address are required" });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    user.phone = phone;
    user.address = address;
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changeAvatar = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const filePath = req.file?.path;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (!filePath) {
    res.status(400).json({ message: "Avatar file is required" });
    return;
  }
  // Update user avatar
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { avatar: filePath },
    { new: true }
  );

  if (!user) res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
};

export const banUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const currentUser = req.user;

   if (!currentUser) {
    res.status(401).json({ message: "Unauthenticated" });
    return;
  }

  if (currentUser.role !== "ADMIN") {
    res.status(403).json({ message: "Only admin can ban users" });
    return;
  }

  try {
    const userToBan = await User.findById(userId);
    if (!userToBan) {
      res.status(404).json({ message: "User not found" });
      return;
    }

     if (userToBan.status === "BLOCKED") {
      res.status(400).json({ message: "User is already banned" });
      return;
    }

    if (userToBan.role === "ADMIN") {
      res.status(403).json({ message: "Cannot ban admin accounts" });
      return;
    }

    userToBan.status = "BLOCKED";
    await userToBan.save();

    res.status(200).json({ message: "User has been banned", user: userToBan });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unbanUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const currentUser = req.user;

  if (!currentUser) {
    res.status(401).json({ message: "Unauthenticated" });
    return;
  }

  if (currentUser.role !== "ADMIN") {
    res.status(403).json({ message: "Only admin can unban users" });
    return;
  }

  try {
    const userToUnban = await User.findById(userId);
    if (!userToUnban) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (userToUnban.status !== "BLOCKED") {
      res.status(400).json({ message: "User is not banned" });
      return;
    }

    userToUnban.status = "ACTIVE";
    await userToUnban.save();

    res
      .status(200)
      .json({ message: "User has been unbanned", user: userToUnban });
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
