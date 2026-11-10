// Data models & types - All live data is persisted in MongoDB Atlas and served from Cloudinary CDN.
// All static mock data has been cleared per system architecture specifications.

export interface ClientPartner {
  _id?: string;
  name: string;
  image: string;
  websiteLink?: string;
  order?: number;
  isActive?: boolean;
}

export interface ThemeItem {
  _id: string;
  websiteTitle: string;
  slug?: string;
  category: string;
  price: number;
  discountPrice: number;
  websiteLink: string;
  photo: string;
  popularBadge?: boolean;
  featuredBadge?: boolean;
  createdAt?: string;
  description?: string;
  features?: string[];
  clientName?: string;
  mediaType?: "image" | "video";
  video?: string;
  videoThumbnail?: string;
  challenge?: string;
  solution?: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  discountPrice?: number;
  period?: string;
  badge?: string;
  description?: string;
  features: string[];
  isPopular?: boolean;
}

export interface ProductReview {
  name: string;
  designation?: string;
  company?: string;
  location?: string;
  rating: number;
  comment: string;
  tag?: string;
}

export interface ProductItem {
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
  features?: string[];
  techStack?: string[];
  pricingPlans: PricingPlan[];
  reviews?: ProductReview[];
  liveUrl?: string;
  whatsappNumber?: string;
  popularBadge?: boolean;
  featuredBadge?: boolean;
  order?: number;
  status?: "active" | "draft";
  createdAt?: string;
}

export interface BlogItem {
  _id: string;
  title: string;
  slug?: string;
  content: string;
  category: string;
  author: string;
  photo: string;
  createdAt: string;
  comments?: { length?: number; leanth?: number };
}

export interface PortfolioProject {
  _id: string;
  title: string;
  slug?: string;
  category: string;
  clientName: string;
  completionYear: string;
  mediaType: "image" | "video";
  thumbnail: string;
  videoUrl?: string;
  videoThumbnail?: string;
  images?: string[];
  liveUrl?: string;
  shortDescription: string;
  fullDescription: string;
  challenge?: string;
  solution?: string;
  features: string[];
  techStack: string[];
  results?: string[];
  isFeatured?: boolean;
}

export interface GalleryItem {
  _id: string;
  title: string;
  category: "Events" | "Office Life" | "Projects" | "Team Moments" | "Achievements" | string;
  imageUrl: string;
  description?: string;
  date?: string;
}

// All static data arrays are emptied - system operates 100% online from MongoDB Atlas & Cloudinary CDN
export const CLIENT_PARTNERS: ClientPartner[] = [];
export const SAMPLE_THEMES: ThemeItem[] = [];
export const SAMPLE_BLOGS: BlogItem[] = [];
export const COMPLETED_PROJECTS: PortfolioProject[] = [];
export const GALLERY_ITEMS: GalleryItem[] = [];

export const TECH_STACK = [
  { name: "React", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853454/okobiz/assets/react-4gEGafqw.png", category: "Frontend" },
  { name: "Next.js", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852892/okobiz/assets/next-pbmXyU91.png", category: "Frontend" },
  { name: "TypeScript", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853468/okobiz/assets/typescript-pim-Yoqf.png", category: "Language" },
  { name: "JavaScript", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853419/okobiz/assets/javascript-BjiGfaT-.png", category: "Language" },
  { name: "Node.js", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853426/okobiz/assets/node-D1pjTLHC.png", category: "Backend" },
  { name: "Express", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853404/okobiz/assets/express-DsJf69aV.png", category: "Backend" },
  { name: "Tailwind CSS", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853466/okobiz/assets/tailwind-B1tnhwjB.png", category: "Frontend" },
  { name: "Bootstrap", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853393/okobiz/assets/bootstrapp-DjByhJwM.png", category: "Frontend" },
  { name: "HTML5", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853414/okobiz/assets/html-vSit1yPX.png", category: "Frontend" },
  { name: "CSS3", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853398/okobiz/assets/css-GlqqT3ly.png", category: "Frontend" },
  { name: "MongoDB", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852897/okobiz/assets/mongodb-BhSBY_rK.png", category: "Database" },
  { name: "PostgreSQL", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853448/okobiz/assets/postgre-BCPf7xnP.png", category: "Database" },
  { name: "Firebase", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853406/okobiz/assets/firebase-D6wj8-Ng.png", category: "Database" },
  { name: "Flutter", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852894/okobiz/assets/fluter-B6Xx9c-F.png", category: "Mobile" },
  { name: "Swift", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853464/okobiz/assets/swift-gACdK0aD.png", category: "Mobile" },
  { name: "Kotlin", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853421/okobiz/assets/kotlin-48a0HPbU.png", category: "Mobile" },
  { name: "Android", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853387/okobiz/assets/android-2KKuArF2.png", category: "Mobile" },
  { name: "iOS", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853416/okobiz/assets/ios-BA_o8208.png", category: "Mobile" },
  { name: "AWS", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852879/okobiz/assets/aws-Mk_6g64u.png", category: "Cloud" },
  { name: "Docker", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852903/okobiz/assets/docker-BRV4pgF-.png", category: "DevOps" },
  { name: "GitHub", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853409/okobiz/assets/github-DHHUrUgn.png", category: "DevOps" },
  { name: "Postman", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853450/okobiz/assets/postman-CeWr4NhK.png", category: "Testing" },
  { name: "Tag Manager", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853465/okobiz/assets/tagmanager-BVABJao8.png", category: "Analytics" },
  { name: "Google Analytics", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853409/okobiz/assets/google-analytics-DLxCPswT.png", category: "Analytics" },
  { name: "REST API", icon: "https://res.cloudinary.com/dccui8s58/image/upload/v1790853456/okobiz/assets/restapi-iD2l83gj.png", category: "API" }
];
