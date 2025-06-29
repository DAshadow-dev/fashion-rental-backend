import mongoose, { Schema } from "mongoose";
import { IReport } from "../types/report.type";

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    description: { type: String, trim: true }, 
  },
  { timestamps: true }
);

const Report = mongoose.model<IReport>("Report", ReportSchema);

export default Report;
