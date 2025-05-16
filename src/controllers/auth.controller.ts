import { Request, Response } from "express";
import nodemailer from "nodemailer";
import User from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/authUtils";
import { generateToken } from "../utils/jwt";

export const registerUser = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { username, email, password, storeInfo, role } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await hashPassword(password);
        
        const user = await User.create({
            username,
            email,
            passwordHash: hashedPassword,
            role,
            storeInfo,
        });

        const token = generateToken({ id: user._id, role: user.role });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error: any) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
}

export const loginUser = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ id: user._id, role: user.role });

        res.json({ message: 'Login successful', token });
    } catch (error: any) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
}

export const forgotPassword = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const token = generateToken({ id: user._id, role: user.role });

        res.json({ message: 'Password reset token sent to email', token });
        
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to send password reset token', error: error.message });
    }
}
