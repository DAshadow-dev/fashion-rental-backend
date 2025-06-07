import { JwtPayload, verifyRefreshToken } from "./../utils/jwt";
import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/authUtils";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { sendEmail, sendPasswordResetEmail, sendVerificationEmail } from "../config/mailer";

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
    const payload = { id: user._id, role: user.role };    // Tạo access + refresh token
    const accessToken = generateAccessToken(payload as JwtPayload);
    const refreshToken = generateRefreshToken(payload as JwtPayload);

    // Set refresh token vào httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
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
    }    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload as JwtPayload);
    const refreshToken = generateRefreshToken(payload as JwtPayload);

    // Set refresh token vào httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      accessToken,
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
    // Lấy refresh token từ cookie thay vì body
    const refreshToken = req.cookies.refreshToken;
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

    // Set refresh token mới vào cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken: newAccessToken,
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
    // Xóa refresh token cookie
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

// Forgot Password - Send reset email
export const forgotPassword = async (req: Request, res: Response) : Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
     res.status(404).json({ message: "User not found" });
     return;
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpire = new Date(Date.now() + 1000 * 60 * 15); // 15 phút
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = resetTokenExpire;
  await user.save();
  // Gửi email
  await sendPasswordResetEmail(email, resetToken);
  res.json({ message: "Reset password email sent" });
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
     res.status(400).json({ message: "Invalid or expired token" });
     return;
  }
  user.password = await hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: "Password reset successful" });
};

// Google OAuth2
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      username: profile.displayName,
      email: profile.emails?.[0].value,
      googleId: profile.id,
      role: "CUSTOMER", 
    });
  }
  return done(null, user);
}));
