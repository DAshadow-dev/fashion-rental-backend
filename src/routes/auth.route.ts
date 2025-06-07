import { RequestHandler, Router } from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller";
import { getCurrentUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import type { IUser } from "../models/user.model";
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", authMiddleware as RequestHandler, getCurrentUser);
// Google OAuth2
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  // Sau khi xác thực thành công, tạo accessToken, refreshToken, set cookie và redirect về FE
  const user = req.user as any;
  if (!user) {
    return res.redirect((process.env.FRONTEND_URL || "http://localhost:3000") + "/login?error=google");
  }
  // Tạo token
  const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
  const payload = { id: user._id || user.id, role: user.role || "user" };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  // Set refresh token vào httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  // Redirect về FE kèm accessToken trên query
  const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/google/callback?accessToken=${accessToken}`;
  return res.redirect(redirectUrl);
});

export default router;
