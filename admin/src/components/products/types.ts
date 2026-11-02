export interface PricingPlanForm {
  name: string;
  price: number;
  discountPrice: number;
  period: string;
  badge: string;
  description: string;
  featuresText: string;
  isPopular: boolean;
}

export interface ProductReviewForm {
  name: string;
  designation: string;
  company: string;
  location: string;
  rating: number;
  comment: string;
  tag: string;
}

export interface ProductFormState {
  title: string;
  slug: string;
  tagline: string;
  category: string;
  customCategory: string;
  mediaType: "image" | "video";
  thumbnail: string;
  images: string[];
  video: string;
  videoThumbnail: string;
  youtubeUrl: string;
  liveUrl: string;
  whatsappNumber: string;
  popularBadge: boolean;
  featuredBadge: boolean;
  order: number;
  status: "active" | "draft";
  description: string;
  featuresText: string;
  pricingPlans: PricingPlanForm[];
  reviews: ProductReviewForm[];
}

export type ProductTabType = "basics" | "media" | "description" | "pricing";
