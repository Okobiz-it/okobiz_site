import mongoose, { Schema } from "mongoose";

export interface IClientPartner {
  _id: string;
  name: string;
  image: string;
  websiteLink?: string;
  order: number;
  isActive: boolean;
}

const ClientPartnerSchema = new Schema<IClientPartner>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  image: { type: String, required: true },
  websiteLink: { type: String, default: "" },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

export default mongoose.models.ClientPartner || mongoose.model<IClientPartner>("ClientPartner", ClientPartnerSchema);
