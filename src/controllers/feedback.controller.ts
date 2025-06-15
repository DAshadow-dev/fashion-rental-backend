import { Request, Response } from "express";
import { Feedback } from "../models/feedback.model";
import Payment from "../models/payment.model";

export const feedbackController = {
  // Create new feedback
  async createFeedback(req: Request, res: Response) {
    try {
      console.log("req.body", req.body);
      const { storeId, rating, comment } = req.body;
      const customerId = (req.user as any).id;
      console.log("customerId", customerId);

      // // Check if customer has made any payment to the store
      // const hasPayment = await Payment.findOne({
      //   customerId,
      //   storeId,
      //   status: "completed",
      // });

      // if (!hasPayment) {
      //    res.status(403).json({
      //     message:
      //       "You can only provide feedback after making a payment to this store",
      //   });
      //   return;
      // }

      // Check if feedback already exists
      const existingFeedback = await Feedback.findOne({ customerId, storeId });
      if (existingFeedback) {
         res.status(400).json({
          message: "You have already provided feedback for this store",
        });
        return;
      }

      const feedback = new Feedback({
        customerId,
        storeId,
        rating,
        comment,
      });

      await feedback.save();

      res.status(201).json({
        message: "Feedback submitted successfully",
        feedback,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating feedback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get feedback for a store
  async getStoreFeedback(req: Request, res: Response) {
    try {
      const { storeId } = req.params;

      const feedbacks = await Feedback.find({ storeId })
        .populate("customerId", "username email")
        .sort({ createdAt: -1 });

      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching store feedback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update feedback
  async updateFeedback(req: Request, res: Response) {
    try {
      const { feedbackId } = req.params;
      const { rating, comment } = req.body;
      const customerId = (req.user as any).id;

      const feedback = await Feedback.findOne({ _id: feedbackId, customerId });

      if (!feedback) {
         res.status(404).json({
          message: "Feedback not found or you are not authorized to update it",
        });
        return;
      }

      feedback.rating = rating;
      feedback.comment = comment;
      await feedback.save();

      res.status(200).json({
        message: "Feedback updated successfully",
        feedback,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating feedback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete feedback
  async deleteFeedback(req: Request, res: Response) {
    try {
      const { feedbackId } = req.params;
      const customerId = (req.user as any).id;

      const feedback = await Feedback.findOneAndDelete({
        _id: feedbackId,
        customerId,
      });

      if (!feedback) {
         res.status(404).json({
          message: "Feedback not found or you are not authorized to delete it",
        });
        return;
      }

      res.status(200).json({
        message: "Feedback deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting feedback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
