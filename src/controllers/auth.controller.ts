import { JwtPayload, verifyRefreshToken } from './../utils/jwt';
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import User from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/authUtils";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
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

    // (Tùy chọn) Lưu refreshToken vào DB để kiểm soát (ví dụ blacklist khi logout)
    // await RefreshTokenModel.create({ token: refreshToken, user: user._id });

    // Set HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken, 
    });
  } catch (error: any) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt with email:", email);

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

    // (Tùy chọn) Lưu refreshToken vào DB
    // await RefreshTokenModel.create({ token: refreshToken, user: user._id });

    // Set cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      accessToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    console.log("Refresh token received:", token);
    if (!token) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    // Verify signature
    const payload = verifyRefreshToken(token as string);
    if (!payload) {
       res.status(403).json({ message: "Invalid refresh token" });
       return;
    }

    // Tạo accessToken mới
    const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });

    res.json({ accessToken: newAccessToken });
  } catch (error: any) {
    res.status(500).json({ message: "Could not refresh token", error: error.message });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      // (Tùy chọn) Xóa token khỏi DB
      // await RefreshTokenModel.deleteOne({ token });
    }
    // Xóa cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.sendStatus(204); // No Content
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

