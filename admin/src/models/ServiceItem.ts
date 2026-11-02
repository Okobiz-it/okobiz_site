import mongoose, { Schema } from "mongoose";

export interface IWhyChooseUsItem {
  title: string;
  desc: string;
}

export interface IServiceItem {
  _id: string;
  title: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  image?: string;
  bannerImage?: string;
  bannerSubtitle?: string;
  features: string[];
  whyChooseUs?: IWhyChooseUsItem[];
  techStack?: string[];
  priceRange?: string;
  order?: number;
}

const ServiceItemSchema = new Schema<IServiceItem>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  shortDesc: { type: String, default: "" },
  fullDesc: { type: String, default: "" },
  icon: { type: String, default: "Monitor" },
  image: { type: String, default: "" },
  bannerImage: { type: String, default: "" },
  bannerSubtitle: { type: String, default: "" },
  features: [{ type: String }],
  whyChooseUs: [
    {
      title: { type: String, default: "" },
      desc: { type: String, default: "" }
    }
  ],
  techStack: [{ type: String }],
  priceRange: { type: String, default: "" },
  order: { type: Number, default: 0 }
});

export default mongoose.models.ServiceItem || mongoose.model<IServiceItem>("ServiceItem", ServiceItemSchema);
