import mongoose, { Schema } from "mongoose";

export interface IInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  service: { type: String, default: "" },
  message: { type: String, required: true },
  status: { type: String, enum: ["new", "in_progress", "resolved"], default: "new" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);
