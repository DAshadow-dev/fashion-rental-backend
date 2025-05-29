import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/request.type';
import { verifyAccessToken } from "../utils/jwt";

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No access token provided" });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
  req.user = { id: payload.id, role: payload.role };
  next();
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden: Unauthorized role, require role: ' + roles.join(', ') });
    }
    next();
  };
};

