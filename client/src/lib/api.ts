import { ThemeItem, BlogItem, ClientPartner, TeamMember, GalleryItem, ProductItem, PricingPlan } from "../data/mockData";
import { createSlug } from "./slug";

const API_BASE = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001");

function isDynamicBailout(err: any): boolean {
  return err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage");
}

export async function getProducts(): Promise<ProductItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((p: any) => ({
        ...p,
        slug: p.slug || createSlug(p.title)
      }));
    }
  } catch (err: any) {
    if (isDynamicBailout(err)) throw err;
    console.warn("Failed to fetch products from MongoDB:", err?.message || err);
  }
  return [];
}

export async function getProductById(id: string): Promise<ProductItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          ...json.data,
          slug: json.data.slug || createSlug(json.data.title)
        };
      }
    }
    const products = await getProducts();
    const cleanId = id.toLowerCase();
    return products.find((p) =>
      p._id === id ||
      (p.slug && p.slug.toLowerCase() === cleanId) ||
      createSlug(p.title) === cleanId
    ) || null;
  } catch (err) {
    return null;
  }
}

export function getProductWhatsAppUrl(productTitle: string, customNumber?: string, planName?: string): string {
  const cleanNumber = (customNumber || "8801973590937").replace(/[^0-9]/g, "");
  const text = planName
    ? `Hello okobiz, I am interested in purchasing the "${planName}" package for "${productTitle}". Please share setup details and payment procedures.`
    : `Hello okobiz, I would like to ask for a live demo and test credentials for "${productTitle}". Please share the demo access details.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export async function getThemes(): Promise<ThemeItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/themes`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((t: any) => ({
        ...t,
        slug: t.slug || createSlug(t.websiteTitle)
      }));
    }
  } catch (err: any) {
    if (isDynamicBailout(err)) throw err;
    console.warn("Failed to fetch themes from MongoDB:", err?.message || err);
  }
  return [];
}

export async function getThemeById(id: string): Promise<ThemeItem | null> {
  try {
    const themes = await getThemes();
    const cleanId = id.toLowerCase();
    return themes.find((t) =>
      t._id === id ||
      (t.slug && t.slug.toLowerCase() === cleanId) ||
      createSlug(t.websiteTitle) === cleanId
    ) || themes[0] || null;
  } catch (err) {
    return null;
  }
}

export async function getBlogs(): Promise<BlogItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/blogs`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err: any) {
    if (isDynamicBailout(err)) throw err;
    console.warn("Failed to fetch blogs from MongoDB:", err?.message || err);
  }
  return [];
}

export async function getBlogById(id: string): Promise<BlogItem | null> {
  try {
    const blogs = await getBlogs();
    return blogs.find((b) => b._id === id) || blogs[0] || null;
  } catch (err) {
    return null;
  }
}

export async function getClients(): Promise<ClientPartner[]> {
  try {
    const res = await fetch(`${API_BASE}/api/clients`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn("Failed to fetch clients from MongoDB:", err);
  }
  return [];
}

export async function getTeam(): Promise<TeamMember[]> {
  try {
    const res = await fetch(`${API_BASE}/api/team`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn("Failed to fetch team from MongoDB:", err);
  }
  return [];
}

export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/gallery`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn("Failed to fetch gallery from MongoDB:", err);
  }
  return [];
}

export interface HeroSlideItem {
  _id?: string;
  title: string;
  img: string;
  order?: number;
  isActive?: boolean;
}

export interface FaqItemType {
  _id?: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export async function getHeroSlides(): Promise<HeroSlideItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/hero`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (err) {
    console.warn("Failed to fetch hero slides from MongoDB:", err);
  }
  return [];
}

export async function getFaqs(): Promise<FaqItemType[]> {
  try {
    const res = await fetch(`${API_BASE}/api/faqs`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (err) {
    console.warn("Failed to fetch faqs from MongoDB:", err);
  }
  return [];
}


export async function sendContactMessage(data: {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.subject || "General Inquiry",
        message: data.message
      }),
    });
    const json = await res.json();
    return { success: json.success, message: "Thank you! Your message has been sent successfully." };
  } catch (err: any) {
    return { success: true, message: "Thank you for reaching out! We will contact you soon." };
  }
}

export async function sendOrder(formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string;
    const number = formData.get("number") as string;
    const message = formData.get("message") as string;
    const themeTitle = formData.get("themeTitle") as string;

    const res = await fetch(`${API_BASE}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName || "Project Order Customer",
        email: "order@okobiz.com",
        phone: number || "",
        service: `Theme Order: ${themeTitle || "Custom Web Theme"}`,
        message: message || "Direct web theme order request."
      }),
    });
    const json = await res.json();
    return { success: json.success, message: "Order placed successfully! We will contact you shortly." };
  } catch (err: any) {
    return { success: true, message: "Order placed successfully! We will contact you shortly." };
  }
}

export interface PortfolioPdfData {
  heading: string;
  subheading: string;
  pdfUrl: string;
  badge?: string;
}

export async function getPortfolioPdf(): Promise<PortfolioPdfData> {
  const defaultData: PortfolioPdfData = {
    heading: "okobiz Official Profile & Credentials 2024",
    subheading: "Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)",
    pdfUrl: "/assets/okobiz_profile-DvU1SuUS.pdf",
    badge: ""
  };

  try {
    const res = await fetch(`${API_BASE}/api/portfolio-pdf`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      return {
        heading: json.data.heading || defaultData.heading,
        subheading: json.data.subheading || defaultData.subheading,
        pdfUrl: json.data.pdfUrl || defaultData.pdfUrl,
        badge: json.data.badge !== undefined ? json.data.badge : ""
      };
    }
  } catch (err) {
    console.warn("Failed to fetch portfolio PDF info:", err);
  }
  return defaultData;
}

export interface ServiceClientItem {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  bannerImage?: string;
  bannerSubtitle?: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  whyChooseUs?: Array<{ _id?: string; title: string; desc: string }>;
  techStack?: string[];
  pricingPlans?: PricingPlan[];
  order?: number;
}

export const DEFAULT_SERVICES: ServiceClientItem[] = [
  {
    "_id": "srv-1",
    "title": "Website & App Development",
    "slug": "website-app-development-service",
    "image": "/assets/website-app-DOXr3sR7.webp",
    "bannerImage": "/assets/web-CPDVLYNo.jpeg",
    "bannerSubtitle": "Custom, scalable, and high-performance digital platforms",
    "shortDesc": "We offer professional website and app development services that are suited to your business requirements.",
    "fullDesc": "<p><b>To </b><i>provide</i> a <u>consistent </u>user experience, our team of skilled developers guarantees that your website works perfectly across all devices and platforms. Whether it's an online store, an app page, or a business website, we use the newest technology.</p>",
    "features": [
      "Custom Web Applications",
      "Mobile App (iOS & Android)",
      "E-Commerce Platforms",
      "API & Cloud Integrations"
    ],
    "whyChooseUs": [
      {
        "title": "Expert Team",
        "desc": "Highly skilled developers with extensive experience in Next.js, MERN stack, Flutter, and cloud architecture.",
        "_id": "6ac626d40d9b092b09efe6b9"
      },
      {
        "title": "Customized Solutions",
        "desc": "Tailored to meet your specific business goals, user personas, and conversion milestones.",
        "_id": "6ac626d40d9b092b09efe6ba"
      },
      {
        "title": "Agile Methodology",
        "desc": "Rapid sprint cycles with regular demos, quality testing, and continuous deployment.",
        "_id": "6ac626d40d9b092b09efe6bb"
      },
      {
        "title": "Transparent Process",
        "desc": "Clear roadmap tracking, milestone reports, and dedicated account management.",
        "_id": "6ac626d40d9b092b09efe6bc"
      },
      {
        "title": "Post-Development Support",
        "desc": "Comprehensive 24/7 maintenance, server monitoring, and feature upgrades.",
        "_id": "6ac626d40d9b092b09efe6bd"
      }
    ],
    "techStack": [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "Express",
      "Tailwind CSS",
      "MongoDB",
      "PostgreSQL",
      "Flutter",
      "AWS",
      "Docker"
    ],
    "pricingPlans": [
      {
        "name": "Starter Web",
        "price": 15000,
        "discountPrice": 20000,
        "period": "One-Time Setup",
        "badge": "Startup Tier",
        "description": "Ideal for small businesses needing a high-speed corporate presence.",
        "features": [
          "Custom UI/UX Design & Branding",
          "5 Core High-Converting Pages",
          "100% Mobile & Tablet Responsive",
          "Contact Form & Direct WhatsApp Integration",
          "Speed Optimization & Basic SEO",
          "1 Month Free Technical Support"
        ],
        "isPopular": false
      },
      {
        "name": "Business Full-Stack",
        "price": 35000,
        "discountPrice": 45000,
        "period": "One-Time Setup",
        "badge": "Most Popular",
        "description": "Full-stack web application with dynamic dashboard and database.",
        "features": [
          "Next.js 14 & Node.js Custom Architecture",
          "Interactive Admin Dashboard & CMS",
          "MongoDB / PostgreSQL Database Integration",
          "Secure User Authentication & RBAC",
          "Online Payment Gateway (bKash/Nagad/SSL)",
          "95+ Google PageSpeed Score",
          "3 Months Dedicated Support & Backups"
        ],
        "isPopular": true
      },
      {
        "name": "Enterprise Ecosystem",
        "price": 75000,
        "discountPrice": 95000,
        "period": "One-Time Setup",
        "badge": "Scalable SaaS",
        "description": "High-concurrency web & mobile app ecosystem with cloud infrastructure.",
        "features": [
          "Complete Web App + Cross-Platform Mobile App (Flutter)",
          "Microservices Backend & Scalable REST/GraphQL APIs",
          "Real-Time WebSockets & Push Notifications",
          "Automated CI/CD Deployment Pipeline on AWS/Docker",
          "Enterprise Grade Data Encryption & Auditing",
          "Dedicated Senior Project Manager",
          "6 Months Priority SLA Maintenance"
        ],
        "isPopular": false
      }
    ],
    "order": 1
  },
  {
    "_id": "srv-2",
    "title": "Seo And Website Development",
    "slug": "seo-website-development-service",
    "image": "/assets/seo-C2Lrhrz-.webp",
    "bannerImage": "/assets/seo-2-Chqa_ILp.png",
    "bannerSubtitle": "Rank higher on Google, drive organic traffic, and accelerate customer conversion",
    "shortDesc": "We specialize in expert digital marketing consultation, customized for your business, location, and target audience. Our comprehensive services encompass website management and SEO, aimed at boosting online presence, enhancing search rankings, improving user experience, and optimizing performance through targeted keywords and content updates.",
    "fullDesc": "<p>Dominate search engine rankings with okobiz's end-to-end SEO and website optimization services. We conduct deep technical site audits, keyword competitor analysis, on-page optimization, and high-authority link-building strategies.</p><p>Our developers ensure your website scores 95+ on Google PageSpeed Insights with core web vitals optimization, structured data schemas, and lightning-fast loading speeds.</p>",
    "features": [
      "Technical SEO & Core Web Vitals Optimization",
      "Keyword Research & High-Intent Strategy",
      "On-Page Optimization & Semantic HTML Hierarchy",
      "Local Google Business Profile Ranking",
      "Competitor Gap Analysis & Link Building"
    ],
    "whyChooseUs": [
      {
        "title": "Data-Driven Strategy",
        "desc": "We base every decision on search intent analytics and live ranking signals."
      },
      {
        "title": "Sustainable Rankings",
        "desc": "100% white-hat SEO techniques that protect your domain against algorithm updates."
      },
      {
        "title": "Transparent Monthly Reports",
        "desc": "Detailed keyword movement and traffic attribution reports every 30 days."
      }
    ],
    "techStack": [
      "Google Search Console",
      "Google Analytics",
      "Ahrefs",
      "SEMrush",
      "Screaming Frog",
      "Schema Markup"
    ],
    "pricingPlans": [
      {
        "name": "Local Growth SEO",
        "price": 10000,
        "discountPrice": 14000,
        "period": "/ month",
        "badge": "Starter",
        "description": "Rank for local search queries and establish Google visibility.",
        "features": [
          "Complete Technical Site Health Audit",
          "10 High-Intent Target Keywords",
          "Google Search Console & Analytics 4 Setup",
          "Google Business Profile Optimization",
          "Title, Meta & Heading Schema Fixes",
          "Monthly Ranking & Traffic Report"
        ],
        "isPopular": false
      },
      {
        "name": "National Authority SEO",
        "price": 22000,
        "discountPrice": 30000,
        "period": "/ month",
        "badge": "Most Popular",
        "description": "Accelerate organic search traffic and outperform major competitors.",
        "features": [
          "30 High-Volume Target Keywords",
          "Core Web Vitals & Page Speed Fixes",
          "High-DA Quality Backlink Outreach",
          "Competitor Keyword Gap Interception",
          "2 Monthly SEO-Optimized Blog Articles",
          "Bi-Weekly Progress & Keyword Movement Calls"
        ],
        "isPopular": true
      },
      {
        "name": "Enterprise Search Dominance",
        "price": 45000,
        "discountPrice": 60000,
        "period": "/ month",
        "badge": "Market Leader",
        "description": "Full-scale corporate SEO strategy for high-volume revenue generation.",
        "features": [
          "60+ National & International Commercial Keywords",
          "Advanced Structured Data (JSON-LD) Hierarchy",
          "Aggressive Editorial Link Building & PR Distribution",
          "Conversion Rate Optimization (CRO) Recommendations",
          "4 Monthly Long-Form Expert Content Pieces",
          "Dedicated Senior SEO Strategist & 24/7 Monitoring"
        ],
        "isPopular": false
      }
    ],
    "order": 2
  },
  {
    "_id": "srv-3",
    "title": "Consultancy On Digital Marketing",
    "slug": "digital-marketing-service",
    "image": "/assets/digital-4ufNPyE6.webp",
    "bannerImage": "/assets/digital-2-snBkV2Qy.jpeg",
    "bannerSubtitle": "Data-driven campaigns, retargeting pixels, and search engine dominance",
    "shortDesc": "Our specialized digital marketing consultation is customized to fit your business, location, and target audience perfectly. We analyze strategies, audiences, and trends to optimize your marketing approach. With tailored plans, we ensure effective messaging, resource allocation, and robust online growth. Contact us today to begin maximizing your digital presence!",
    "fullDesc": "<p>Accelerate your brand growth with data-backed digital marketing campaigns engineered for high conversion rates. We design multi-channel acquisition funnels spanning Facebook, Instagram, Google Ads, LinkedIn, and programmatic display networks.</p><p>By integrating pixel tracking, server-side conversion APIs, and custom CRM attribution, we ensure your ad budget delivers measurable ROI and sustainable pipeline growth.</p>",
    "features": [
      "PPC & Google Ads Campaign Management",
      "Meta & TikTok High-Converting Ad Creative",
      "Server-Side Facebook Pixel & Conversion API",
      "Email & SMS Automated Retargeting Funnels",
      "Conversion Rate Optimization (CRO)"
    ],
    "whyChooseUs": [
      {
        "title": "Targeted Precision",
        "desc": "Laser-focused audience segments tailored to buyer personas."
      },
      {
        "title": "Maximized Ad Spend ROI",
        "desc": "Continuous A/B testing of creatives and bid strategies to lower CPA."
      },
      {
        "title": "Full-Funnel Tracking",
        "desc": "End-to-end analytics from first impression to verified purchase."
      }
    ],
    "techStack": [
      "Meta Ads Manager",
      "Google Ads",
      "TikTok Ads",
      "Google Tag Manager",
      "Mailchimp",
      "Klaviyo"
    ],
    "pricingPlans": [
      {
        "name": "Ad Campaign Starter",
        "price": 12000,
        "discountPrice": 16000,
        "period": "/ month",
        "badge": "Lead Gen",
        "description": "Launch targeted ads with verified tracking and lead capture.",
        "features": [
          "Meta Ads (Facebook & Instagram) Setup",
          "Ad Spend Management up to $600/month",
          "4 Custom Static Ad Creatives & Copywriting",
          "Audience Targeting & Demographics Setup",
          "Basic Pixel & Lead Generation Funnel"
        ],
        "isPopular": false
      },
      {
        "name": "Growth Performance Marketing",
        "price": 25000,
        "discountPrice": 35000,
        "period": "/ month",
        "badge": "High Conversion",
        "description": "Multi-channel funnel with retargeting and automated tracking.",
        "features": [
          "Meta Ads + Google Search & YouTube Ads",
          "Ad Spend Management up to $2,500/month",
          "10 High-Converting Creatives + 2 Motion Ads",
          "Server-Side Facebook Conversion API (CAPI)",
          "Dynamic Retargeting & Cart Abandonment Funnels",
          "Continuous A/B Testing & Weekly CPA Optimization"
        ],
        "isPopular": true
      },
      {
        "name": "Omnichannel Scale",
        "price": 50000,
        "discountPrice": 65000,
        "period": "/ month",
        "badge": "Aggressive Scale",
        "description": "Full-scale advertising suite across all major digital channels.",
        "features": [
          "Meta, Google, TikTok, LinkedIn & Display Advertising",
          "Unlimited Ad Spend Management",
          "Custom Creative Sprint (Videos, Reels & Carousels)",
          "CRM & WhatsApp Automation Integration",
          "Full-Funnel ROAS & Attribution Modeling",
          "Dedicated Media Buyer & Weekly Strategy Meetings"
        ],
        "isPopular": false
      }
    ],
    "order": 3
  },
  {
    "_id": "srv-4",
    "title": "Creative Graphic Solution",
    "slug": "graphics-solution-service",
    "image": "/assets/graphic-CV7N5QQ5.webp",
    "bannerImage": "/assets/graphic-2-C80LdtU9.jpeg",
    "bannerSubtitle": "Visual identity, motion design, and high-impact branding",
    "shortDesc": "We elevate your online presence by seamlessly integrating creative graphics into your virtual platforms. Our innovative graphic solutions deliver captivating visual concepts that effectively convey messages through inventive design, enhancing brand recognition and driving engagement.",
    "fullDesc": "<p>Visuals define how customers perceive your company within the first second. okobiz provides comprehensive creative graphic solutions, from memorable corporate logos and brand guidelines to dynamic 3D motion graphics and print collateral.</p><p>Our creative team blends modern aesthetics with persuasive visual psychology to elevate your brand prestige across digital and physical mediums.</p>",
    "features": [
      "Logo Design & Complete Brand Identity Kit",
      "Poster, Banner & Digital Marketing Creatives",
      "Social Media Kits & Carousel Post Systems",
      "Print Materials (Brochures, Catalog, Packaging)",
      "Motion Graphics, 3D Renders & UI/UX Figma Mockups"
    ],
    "whyChooseUs": [
      {
        "title": "Award-Winning Aesthetics",
        "desc": "Distinctive, memorable designs tailored to your corporate vision."
      },
      {
        "title": "Ready-To-Use Formats",
        "desc": "Full vector, print-ready CMYK, and web-optimized asset delivery."
      },
      {
        "title": "Rapid Turnaround",
        "desc": "Quick conceptualization sprints with unlimited collaborative revisions."
      }
    ],
    "techStack": [
      "Figma",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "After Effects",
      "Blender 3D",
      "InDesign"
    ],
    "pricingPlans": [
      {
        "name": "Brand Starter Kit",
        "price": 8000,
        "discountPrice": 12000,
        "period": "One-Time Setup",
        "badge": "Identity",
        "description": "Essential corporate identity package for launching your brand.",
        "features": [
          "3 Unique Logo Design Concepts",
          "Brand Color Palette & Typography System",
          "High-Resolution Vector Files (AI, SVG, PNG, PDF)",
          "Social Media Profile & Cover Assets",
          "Unlimited Conceptual Revisions"
        ],
        "isPopular": false
      },
      {
        "name": "Complete Corporate Identity",
        "price": 18000,
        "discountPrice": 25000,
        "period": "One-Time Setup",
        "badge": "Most Popular",
        "description": "Full brand guidelines and corporate collateral suite.",
        "features": [
          "Comprehensive Brand Guidelines Manual (PDF)",
          "Full Stationery Suite (Business Cards, Letterhead, Envelopes)",
          "10 Social Media Marketing Templates (Canva & PSD)",
          "Company Profile & Brochure Layout (up to 8 pages)",
          "Packaging or Merchandise Mockup Designs",
          "Full Commercial Copyright Transfer"
        ],
        "isPopular": true
      },
      {
        "name": "Master Agency Creative Suite",
        "price": 38000,
        "discountPrice": 50000,
        "period": "One-Time Setup",
        "badge": "Premium Design",
        "description": "3D renders, UI/UX Figma design system, and motion graphics.",
        "features": [
          "Full Corporate Brand Identity Ecosystem",
          "3D Product Modeling & Photorealistic Renders",
          "Motion Graphics Logo Intro & Promo Video",
          "Complete Web/App UI Design System in Figma",
          "Investor Pitch Deck / Catalog Presentation",
          "Dedicated Senior Art Director"
        ],
        "isPopular": false
      }
    ],
    "order": 4
  },
  {
    "_id": "srv-5",
    "title": "Social Media Management",
    "slug": "social-media-management-service",
    "image": "/assets/social-WzytKsh-.webp",
    "bannerImage": "/assets/clientsfotter-o_Y4RCBU.webp",
    "bannerSubtitle": "Engaging social storytelling, community moderation, and brand loyalty",
    "shortDesc": "We specialize in offering superior website and app development services customized for your business, location, and target audience. Our collaborative design and development teams create user-friendly interfaces, responsive layouts, and practical features, enhancing digital interactions and maximizing user satisfaction across websites and mobile apps.",
    "fullDesc": "<p>Build an active, loyal community around your brand with okobiz's complete social media management services. We handle content calendar planning, graphic creation, reels/shorts production, copywriting, and daily audience engagement.</p><p>From LinkedIn thought leadership to viral TikTok and Instagram campaigns, we keep your brand at the forefront of your industry.</p>",
    "features": [
      "Monthly Content Calendar Strategy",
      "Short-Form Video Production (Reels & TikToks)",
      "Daily Community Engagement & DM Management",
      "Influencer Outreach & Strategic Collabs",
      "Monthly Reach, Sentiment & Growth Analytics"
    ],
    "whyChooseUs": [
      {
        "title": "Consistent Brand Voice",
        "desc": "Harmonious messaging and visuals across all social touchpoints."
      },
      {
        "title": "Active Community Nurturing",
        "desc": "Fast response times to comments and inquiries to build trust."
      },
      {
        "title": "Trend Jacking",
        "desc": "Capitalizing on viral cultural trends to boost organic reach."
      }
    ],
    "techStack": [
      "Canva",
      "CapCut",
      "Buffer",
      "Hootsuite",
      "Meta Business Suite",
      "LinkedIn Campaign Mgr"
    ],
    "pricingPlans": [
      {
        "name": "Essential Presence",
        "price": 12000,
        "discountPrice": 16000,
        "period": "/ month",
        "badge": "Starter",
        "description": "Maintain a polished, regular social media voice across platforms.",
        "features": [
          "12 Custom Designed Graphics & Infographics",
          "Engaging Caption Writing & Hashtag Research",
          "Scheduled Publishing across Facebook & Instagram",
          "Community Comment & Message Monitoring",
          "Monthly Engagement & Reach Summary"
        ],
        "isPopular": false
      },
      {
        "name": "Engagement & Viral Reach",
        "price": 24000,
        "discountPrice": 32000,
        "period": "/ month",
        "badge": "Most Popular",
        "description": "Video-focused social growth with daily engagement and stories.",
        "features": [
          "20 High-Quality Visual Posts + Carousels",
          "4 Edited Short-Form Reels / TikTok Videos",
          "Daily Story Highlights & Polls",
          "Proactive Community Building & Fast DM Replies",
          "Influencer Collaboration Outreach",
          "Bi-Weekly Analytics & Strategy Adjustments"
        ],
        "isPopular": true
      },
      {
        "name": "Total Brand Dominance",
        "price": 45000,
        "discountPrice": 60000,
        "period": "/ month",
        "badge": "Full Production",
        "description": "End-to-end social media handling with on-brand video production.",
        "features": [
          "30 Premium Custom Graphics & Carousels",
          "10 High-Impact Reels/Shorts with Voiceover & Motion",
          "Multi-Platform Management (FB, IG, LinkedIn, TikTok)",
          "24/7 Community Moderation & Lead Capture",
          "Monthly Paid Boost Budget Strategy",
          "Dedicated Social Media Manager & Copywriter"
        ],
        "isPopular": false
      }
    ],
    "order": 5
  },
  {
    "_id": "srv-6",
    "title": "Digital Advertising & DSP",
    "slug": "digital-advertising-dsp-service",
    "image": "/assets/advertising-AjUZBcZg.webp",
    "bannerImage": "/assets/about-33-B_PGTXVg.webp",
    "bannerSubtitle": "Programmatic ad buying, demand-side platforms, and global reach",
    "shortDesc": "Businesses can effectively target and manage online ad campaigns, optimize ad spend, and reach their desired demographic with precision through digital advertising and DSP (Demand-Side Platform) services. Explore the optimal solution at okobiz.",
    "fullDesc": "<p>Take your advertising beyond walled gardens with Demand-Side Platform (DSP) programmatic advertising. okobiz leverages real-time bidding (RTB) to deliver high-impact display, native, audio, and connected TV (CTV) ads across premium publisher networks globally.</p><p>Optimize CPM, avoid ad fraud, and reach hyper-targeted audiences with first-party data onboarding and behavioral tracking.</p>",
    "features": [
      "Programmatic RTB Media Buying & Management",
      "Connected TV (CTV) & Digital Audio Ads",
      "First-Party Data Audience Onboarding",
      "Cross-Device Retargeting & Frequency Capping",
      "Brand Safety & Anti-Fraud Real-Time Filters"
    ],
    "whyChooseUs": [
      {
        "title": "Global Inventory Access",
        "desc": "Access top-tier publisher inventory across millions of websites and apps."
      },
      {
        "title": "Hyper-Precise Geo & Demographics",
        "desc": "Target down to specific zip codes, device types, and interests."
      },
      {
        "title": "Cost-Efficient CPMs",
        "desc": "Algorithmic bidding ensures you never overpay for ad impressions."
      }
    ],
    "techStack": [
      "Google Display & Video 360",
      "The Trade Desk",
      "Amazon DSP",
      "AdForm",
      "Moat Analytics"
    ],
    "pricingPlans": [
      {
        "name": "DSP Programmatic Starter",
        "price": 20000,
        "discountPrice": 28000,
        "period": "/ month",
        "badge": "Display RTB",
        "description": "Real-time bidding across top global websites and news publishers.",
        "features": [
          "DSP Platform Setup & Campaign Architecture",
          "Standard IAB Display Banner Formats",
          "Geo-Fencing & Demographic Audience Targeting",
          "Real-Time Anti-Fraud & Brand Safety Filters",
          "Monthly Impression & CTR Attribution Report"
        ],
        "isPopular": false
      },
      {
        "name": "Advanced Video & CTV DSP",
        "price": 40000,
        "discountPrice": 55000,
        "period": "/ month",
        "badge": "Most Popular",
        "description": "Connected TV, digital audio, and high-impact rich media.",
        "features": [
          "Connected TV (CTV) & OTT Video Ad Placement",
          "Digital Audio Advertising (Spotify, Podcasts)",
          "First-Party CRM Data Audience Matching",
          "Cross-Device Frequency Capping & Sequential Retargeting",
          "Viewability Verification (Moat / IAS Integration)",
          "Bi-Weekly Optimization & Inventory Refinement"
        ],
        "isPopular": true
      },
      {
        "name": "Global Enterprise Omnichannel DSP",
        "price": 80000,
        "discountPrice": 110000,
        "period": "/ month",
        "badge": "Global Scale",
        "description": "Multi-DSP orchestration with customized algorithmic bidding.",
        "features": [
          "Multi-DSP Orchestration (Google DV360 & The Trade Desk)",
          "Custom Algorithmic Bidding Models",
          "Global Publisher PMP (Private Marketplace) Deals",
          "Omnichannel Dynamic Creative Optimization (DCO)",
          "Advanced Multi-Touch Attribution Modeling",
          "Dedicated Certified Programmatic Trader"
        ],
        "isPopular": false
      }
    ],
    "order": 6
  }
];

export async function getServices(): Promise<ServiceClientItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/services`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((s: any) => ({
        ...s,
        slug: s.slug || createSlug(s.title)
      }));
    }
  } catch (err: any) {
    if (isDynamicBailout(err)) throw err;
    console.warn("Failed to fetch services, using defaults:", err?.message || err);
  }
  return DEFAULT_SERVICES;
}

export async function getServiceBySlug(slug: string): Promise<ServiceClientItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/services?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          ...json.data,
          slug: json.data.slug || createSlug(json.data.title)
        };
      }
    }
  } catch (err) {}

  // Fallback search through getServices() or DEFAULT_SERVICES
  const all = await getServices();
  const cleanSlug = slug.toLowerCase();
  const match = all.find(
    s =>
      (s.slug && s.slug.toLowerCase() === cleanSlug) ||
      createSlug(s.title) === cleanSlug ||
      s._id === slug ||
      s.slug === `${slug}-service` ||
      slug === `${s.slug}-service`
  );
  return match || DEFAULT_SERVICES[0] || null;
}

export function getServiceWhatsAppUrl(serviceTitle: string, customNumber?: string, planName?: string): string {
  const cleanNumber = (customNumber || "8801973590937").replace(/[^0-9]/g, "");
  const text = planName
    ? `Hello okobiz, I am interested in hiring your team for the "${planName}" package of "${serviceTitle}". Please share onboarding details and a quote.`
    : `Hello okobiz, I am interested in hiring your team for "${serviceTitle}". Please share project timelines and consultation details.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
