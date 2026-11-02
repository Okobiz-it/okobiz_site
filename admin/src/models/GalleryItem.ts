import mongoose, { Schema } from "mongoose";

export interface IGalleryItem {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  order: number;
  featured: boolean;
  createdAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  category: { type: String, default: "Events" },
  imageUrl: { type: String, required: true },
  description: { type: String, default: "" },
  order: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.GalleryItem || mongoose.model<IGalleryItem>("GalleryItem", GalleryItemSchema);
