import mongoose, { Schema } from "mongoose";

export interface IWhyChooseUsItem {
  title: string;
  desc: string;
}

export interface IPricingPlan {
  name: string;
  price: number;
  discountPrice?: number;
  period?: string; // e.g. "One-time Setup", "/ month", "/ year"
  badge?: string; // e.g. "Most Popular", "Best Value"
  description?: string;
  features: string[];
  isPopular?: boolean;
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
  pricingPlans: IPricingPlan[];
  order?: number;
}

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    period: { type: String, default: "One-Time Setup" },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false }
  },
  { _id: false }
);

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
  pricingPlans: [PricingPlanSchema],
  order: { type: Number, default: 0 }
});

export default mongoose.models.ServiceItem || mongoose.model<IServiceItem>("ServiceItem", ServiceItemSchema);
