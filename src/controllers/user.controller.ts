import { AuthRequest } from './../types/request.type';
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
