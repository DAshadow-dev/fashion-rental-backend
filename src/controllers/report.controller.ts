import { AuthRequest } from "../types/request.type";
import { Response } from "express";
import Report from "../models/report.model";
import User from "../models/user.model";

export const createReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reporterId = req.user?.id;
  const { targetId, reason, description } = req.body;

  if (!reporterId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!targetId || !reason) {
    res.status(400).json({ message: "targetId and reason are required" });
    return;
  }

  try {
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      res.status(404).json({ message: "Target user not found" });
      return;
    }

    const report = await Report.create({
      reporter: reporterId,
      target: targetId,
      reason,
      description,
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllReports = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const currentUser = req.user;

  if (!currentUser || currentUser.role !== "ADMIN") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  try {
    const reports = await Report.find()
      .populate("reporter", "username role")
      .populate("target", "username role status")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReportsByTargetId = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const currentUser = req.user;
  const { userId } = req.params;

  try {
    const reports = await Report.find({ target: userId })
      .populate("reporter", "username role")
      .populate("target", "username role status")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports for target:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

