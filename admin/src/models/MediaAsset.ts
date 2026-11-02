import mongoose, { Schema } from "mongoose";

export interface IMediaAsset {
  _id: string;
  name: string;
  filename: string;
  path: string;
  type: "image" | "pdf" | "video";
  size: number;
  mimeType: string;
  url: string;
  publicId?: string;
  createdAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  type: { type: String, enum: ["image", "pdf", "video"], required: true },
  size: { type: Number, default: 0 },
  mimeType: { type: String, default: "" },
  url: { type: String, required: true },
  publicId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.MediaAsset || mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);
