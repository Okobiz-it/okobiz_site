import mongoose, { Schema } from "mongoose";

export interface IBlogItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  photo: string;
  createdAt: Date;
  commentsCount: number;
  isPublished: boolean;
}

const BlogItemSchema = new Schema<IBlogItem>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: "General" },
  author: { type: String, default: "okobiz Team" },
  photo: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  commentsCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
});

export default mongoose.models.BlogItem || mongoose.model<IBlogItem>("BlogItem", BlogItemSchema);
