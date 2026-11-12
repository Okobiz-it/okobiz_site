import { ThemeItem, BlogItem, ClientPartner, GalleryItem, ProductItem, PricingPlan } from "../data/mockData";
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
      return json.data.map((b: any) => ({
        ...b,
        slug: b.slug || createSlug(b.title)
      }));
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
    return blogs.find((b) => b._id === id || b.slug === id) || blogs[0] || null;
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
  thumbnail?: string;
  bannerImage?: string;
  bannerSubtitle?: string;
  mediaType?: "image" | "video";
  images?: string[];
  video?: string;
  videoThumbnail?: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  whyChooseUs?: Array<{ _id?: string; title: string; desc: string }>;
  techStack?: string[];
  pricingPlans?: PricingPlan[];
  order?: number;
}

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
    console.warn("Failed to fetch services from API:", err?.message || err);
  }
  return [];
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
  return match || null;
}

export function getServiceWhatsAppUrl(serviceTitle: string, customNumber?: string, planName?: string): string {
  const cleanNumber = (customNumber || "8801973590937").replace(/[^0-9]/g, "");
  const text = planName
    ? `Hello okobiz, I am interested in hiring your team for the "${planName}" package of "${serviceTitle}". Please share onboarding details and a quote.`
    : `Hello okobiz, I am interested in hiring your team for "${serviceTitle}". Please share project timelines and consultation details.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export interface JobItem {
  _id: string;
  title: string;
  slug: string;
  department: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  experience: string;
  salary: string;
  vacancies: number;
  deadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: "active" | "closed";
  order: number;
  createdAt: string;
}

export async function getJobs(): Promise<JobItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/jobs?active=true`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((j: any) => ({
        ...j,
        slug: j.slug || createSlug(j.title)
      }));
    }
  } catch (err: any) {
    if (isDynamicBailout(err)) throw err;
    console.warn("Failed to fetch jobs from API:", err?.message || err);
  }
  return [];
}

export async function getJobBySlug(slug: string): Promise<JobItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/jobs?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          ...json.data,
          slug: json.data.slug || createSlug(json.data.title)
        };
      }
    }
  } catch (err: any) {
    if (isDynamicBailout(err)) throw err;
    console.warn("Failed to fetch job by slug from API:", err?.message || err);
  }

  const allJobs = await getJobs();
  const lower = slug.toLowerCase();
  const match = allJobs.find(
    (j) => (j.slug && j.slug.toLowerCase() === lower) || j._id === slug
  );
  return match || null;
}

export async function applyForJob(payload: {
  jobId: string;
  jobTitle?: string;
  name: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl: string;
  coverNote?: string;
  experienceYears?: string;
  currentCompany?: string;
  expectedSalary?: string;
  noticePeriod?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to submit application." };
  }
}
