import mongoose, { Schema } from "mongoose";

export interface IFaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const FaqItemSchema = new Schema<IFaqItem>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: "General" },
  order: { type: Number, default: 0 }
});

export default mongoose.models.FaqItem || mongoose.model<IFaqItem>("FaqItem", FaqItemSchema);
