import mongoose, { Schema } from "mongoose";

export interface IPricingPlan {
  name: string;
  price: number;
  discountPrice?: number;
  period?: string; // e.g. "One-time License", "/ month", "/ year"
  badge?: string; // e.g. "Most Popular", "Best Value"
  description?: string;
  features: string[];
  isPopular?: boolean;
}

export interface IProductReview {
  name: string;
  designation?: string;
  company?: string;
  location?: string;
  rating: number;
  comment: string;
  tag?: string;
}

export interface IProductItem {
  _id: string;
  title: string;
  slug?: string;
  tagline?: string;
  category: string;
  mediaType: "image" | "video";
  thumbnail: string;
  images: string[];
  video?: string;
  videoThumbnail?: string;
  description: string;
  features: string[];
  pricingPlans: IPricingPlan[];
  reviews?: IProductReview[];
  liveUrl?: string;
  whatsappNumber?: string;
  popularBadge: boolean;
  featuredBadge: boolean;
  order: number;
  status: "active" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    period: { type: String, default: "One-Time" },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false }
  },
  { _id: false }
);

const ProductReviewSchema = new Schema<IProductReview>(
  {
    name: { type: String, required: true },
    designation: { type: String, default: "" },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    rating: { type: Number, default: 5 },
    comment: { type: String, required: true },
    tag: { type: String, default: "" }
  },
  { _id: false }
);

const ProductItemSchema = new Schema<IProductItem>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    title: { type: String, required: true },
    slug: { type: String, default: "" },
    tagline: { type: String, default: "" },
    category: { type: String, default: "SaaS & ERP" },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    thumbnail: { type: String, default: "" },
    images: [{ type: String }],
    video: { type: String, default: "" },
    videoThumbnail: { type: String, default: "" },
    description: { type: String, default: "" },
    features: [{ type: String }],
    pricingPlans: [PricingPlanSchema],
    reviews: [ProductReviewSchema],
    liveUrl: { type: String, default: "" },
    whatsappNumber: { type: String, default: "+8801973590937" },
    popularBadge: { type: Boolean, default: false },
    featuredBadge: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "draft"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.ProductItem || mongoose.model<IProductItem>("ProductItem", ProductItemSchema);
