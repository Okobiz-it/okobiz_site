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

export const DEFAULT_PRODUCT_FORM: ProductFormState = {
  title: "",
  slug: "",
  tagline: "",
  category: "SaaS & ERP",
  customCategory: "",
  mediaType: "image",
  thumbnail: "",
  images: [],
  video: "",
  videoThumbnail: "",
  youtubeUrl: "",
  liveUrl: "",
  whatsappNumber: "+8801973590937",
  popularBadge: false,
  featuredBadge: false,
  order: 1,
  status: "active",
  description:
    "<h2>Overview</h2><p>Provide a comprehensive overview of your SaaS solution and its core modules.</p><h3>Key Features:</h3><ul><li>Feature item 1</li><li>Feature item 2</li></ul>",
  featuresText:
    "Cloud-Based SaaS Architecture\nRole-Based Access Control\nAutomated Cloud Backups\nFast Responsive Performance",
  pricingPlans: [
    {
      name: "Standard Package",
      price: 15000,
      discountPrice: 20000,
      period: "One-Time Setup",
      badge: "Starter",
      description: "Essential tools for single store or individual business setup.",
      featuresText:
        "Full System Installation\n1 Year Free Cloud Hosting\nStandard User Roles\nEmail & Chat Support",
      isPopular: false,
    },
    {
      name: "Professional Package",
      price: 28000,
      discountPrice: 35000,
      period: "One-Time Setup",
      badge: "Most Popular",
      description: "Ideal for growing enterprises with advanced modules and multi-counters.",
      featuresText:
        "Multi-User / Multi-Counter Support\nAdvanced Analytics & SMS Gateway\nLifetime System License\n24/7 Dedicated WhatsApp Support",
      isPopular: true,
    },
  ],
  reviews: [
    {
      name: "Dr. Rafiqul Islam",
      designation: "Managing Director",
      company: "Al-Madina Pharma Care Ltd.",
      location: "Dhaka",
      rating: 5,
      comment:
        "PharmaCare Pro completely eliminated our medicine expiry losses. The automatic advance alerts and barcode POS billing have made our checkout 3x faster.",
      tag: "Healthcare & Pharmacy",
    },
    {
      name: "Tanvir Ahmed",
      designation: "Founder & Owner",
      company: "The Smokehouse Grill & Cafe",
      location: "Gulshan",
      rating: 5,
      comment:
        "The kitchen order token (KOT) and table occupancy system transformed our dining service. Zero order mistakes and fast billing.",
      tag: "SaaS & ERP",
    },
  ],
};
