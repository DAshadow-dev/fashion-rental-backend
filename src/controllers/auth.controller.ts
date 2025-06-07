import { JwtPayload, verifyRefreshToken } from "./../utils/jwt";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import User from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/authUtils";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password, storeInfo, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      storeInfo,
    });

    // Tạo payload để sign
    const payload = { id: user._id, role: user.role };

    // Tạo access + refresh token
    const accessToken = generateAccessToken(payload as JwtPayload);
    const refreshToken = generateRefreshToken(payload as JwtPayload);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload as JwtPayload);
    const refreshToken = generateRefreshToken(payload as JwtPayload);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    // Verify signature
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    // Tạo accessToken mới
    const newAccessToken = generateAccessToken({
      id: payload.id,
      role: payload.role,
    });

    // Tạo refreshToken mới
    const newRefreshToken = generateRefreshToken({
      id: payload.id,
      role: payload.role,
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Could not refresh token", error: error.message });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

// export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//         const token = generateAccessToken({ id: user._id, role: user.role });

//         res.json({ message: 'Password reset token sent to email', token });

//     } catch (error: any) {
//         res.status(500).json({ message: 'Failed to send password reset token', error: error.message });
//     }
// }
