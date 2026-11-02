import mongoose, { Schema } from "mongoose";

export interface IThemeItem {
  _id: string;
  websiteTitle: string;
  category: string;
  clientName?: string;
  mediaType?: "image" | "video";
  price: number;
  discountPrice: number;
  websiteLink: string;
  photo?: string;
  video?: string;
  videoThumbnail?: string;
  popularBadge: boolean;
  featuredBadge: boolean;
  description: string;
  challenge?: string;
  solution?: string;
  features: string[];
  createdAt: Date;
}

const ThemeItemSchema = new Schema<IThemeItem>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  websiteTitle: { type: String, required: true },
  category: { type: String, default: "Business" },
  clientName: { type: String, default: "" },
  mediaType: { type: String, enum: ["image", "video"], default: "image" },
  price: { type: Number, default: 0 },
  discountPrice: { type: Number, default: 0 },
  websiteLink: { type: String, default: "" },
  photo: { type: String, default: "" },
  video: { type: String, default: "" },
  videoThumbnail: { type: String, default: "" },
  popularBadge: { type: Boolean, default: false },
  featuredBadge: { type: Boolean, default: false },
  description: { type: String, default: "" },
  challenge: { type: String, default: "" },
  solution: { type: String, default: "" },
  features: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ThemeItem || mongoose.model<IThemeItem>("ThemeItem", ThemeItemSchema);
