import fs from "fs";
import path from "path";
import { createSlug } from "./slug";

const DATA_FILE = path.join(process.cwd(), "data", "admin_store.json");

export interface DataStoreSchema {
  heroSlides: Array<{
    _id: string;
    title: string;
    img: string;
    order: number;
    isActive: boolean;
    buttonText: string;
    buttonLink: string;
  }>;
  clients: Array<{
    _id: string;
    name: string;
    image: string;
    websiteLink?: string;
    order: number;
    isActive: boolean;
  }>;
  themes: Array<{
    _id: string;
    websiteTitle: string;
    slug?: string;
    category: string;
    clientName?: string;
    mediaType?: "image" | "video";
    price: number;
    discountPrice: number;
    websiteLink: string;
    photo: string;
    video?: string;
    videoThumbnail?: string;
    popularBadge?: boolean;
    featuredBadge?: boolean;
    description: string;
    challenge?: string;
    solution?: string;
    features: string[];
    createdAt: string;
  }>;
  products: Array<{
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
    pricingPlans: Array<{
      name: string;
      price: number;
      discountPrice?: number;
      period?: string;
      badge?: string;
      description?: string;
      features: string[];
      isPopular?: boolean;
    }>;
    reviews?: Array<{
      name: string;
      designation?: string;
      company?: string;
      location?: string;
      rating: number;
      comment: string;
      tag?: string;
    }>;
    liveUrl?: string;
    whatsappNumber?: string;
    popularBadge?: boolean;
    featuredBadge?: boolean;
    order?: number;
    status: "active" | "draft";
    createdAt: string;
  }>;
  gallery: Array<{
    _id: string;
    title: string;
    category: string;
    imageUrl: string;
    description?: string;
    order: number;
    featured: boolean;
    createdAt: string;
  }>;
  blogs: Array<{
    _id: string;
    title: string;
    content: string;
    category: string;
    author: string;
    photo: string;
    createdAt: string;
    commentsCount: number;
    isPublished: boolean;
  }>;
  team: Array<{
    _id: string;
    name: string;
    designation: string;
    image: string;
    type: "team" | "advisor";
    order: number;
  }>;
  services: Array<{
    _id: string;
    title: string;
    slug: string;
    shortDesc: string;
    fullDesc: string;
    icon?: string;
    image?: string;
    bannerImage?: string;
    bannerSubtitle?: string;
    features: string[];
    whyChooseUs?: Array<{ title: string; desc: string }>;
    techStack?: string[];
    pricingPlans: Array<{
      name: string;
      price: number;
      discountPrice?: number;
      period?: string;
      badge?: string;
      description?: string;
      features: string[];
      isPopular?: boolean;
    }>;
    order?: number;
  }>;
  faqs: Array<{
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
  }>;
  media: Array<{
    _id: string;
    name: string;
    filename: string;
    path: string;
    type: "image" | "pdf" | "video";
    size: number;
    mimeType: string;
    url: string;
    createdAt: string;
  }>;
  inquiries: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    status: "new" | "in_progress" | "resolved";
    createdAt: string;
  }>;
  settings: {
    siteName: string;
    contactPhone: string;
    contactEmail: string;
    contactAddress: string;
    whatsappNumber: string;
    stats: {
      journeyStarted: string;
      happyClients: string;
      teamMembers: string;
      yearsOfExcellence: string;
    };
    portfolioPdf?: {
      heading: string;
      subheading: string;
      pdfUrl: string;
      badge?: string;
    };
  };
}

const DEFAULT_STORE: DataStoreSchema = {
  heroSlides: [
    { _id: "hero-1", title: "Drive Business, Elevate Success", img: "/assets/Untitled-10-C-7O9vGO.webp", order: 1, isActive: true, buttonText: "More Information", buttonLink: "/contact-us" },
    { _id: "hero-2", title: "Boosting Business Digitally", img: "/assets/Untitled-11-BtrXcvlB.webp", order: 2, isActive: true, buttonText: "Our Services", buttonLink: "/services" },
    { _id: "hero-3", title: "Transforming Ideas into Growth", img: "/assets/Untitled-12-DD3oUXmC.webp", order: 3, isActive: true, buttonText: "Explore Portfolio", buttonLink: "/portfolio" },
    { _id: "hero-4", title: "Where Creativity Meets Technology", img: "/assets/Untitled-13-C9Bpoyra.webp", order: 4, isActive: true, buttonText: "Get In Touch", buttonLink: "/contact-us" },
    { _id: "hero-5", title: "Empowering Your Digital future", img: "/assets/Untitled-14-FHKbdJRS.webp", order: 5, isActive: true, buttonText: "Our Story", buttonLink: "/about" }
  ],
  clients: [
    { _id: "c-1", name: "Nitol Niloy", image: "/assets/nitol niloy-C3PFPoNU.png", websiteLink: "https://nitolniloy.com.bd", order: 1, isActive: true },
    { _id: "c-2", name: "Agro Infusion", image: "/assets/agroinfusion-Drvh30g_.png", websiteLink: "https://agroinfusion.com", order: 2, isActive: true },
    { _id: "c-3", name: "OGV", image: "/assets/ogv-C2n4LvNa.png", websiteLink: "", order: 3, isActive: true },
    { _id: "c-4", name: "DOOLA", image: "/assets/DOOLA-BwowQigu.png", websiteLink: "https://doola.com", order: 4, isActive: true },
    { _id: "c-5", name: "VENUES", image: "/assets/VENUES-CXz5tN5L.png", websiteLink: "", order: 5, isActive: true },
    { _id: "c-6", name: "KORTE", image: "/assets/KORTE-D3466O8E.png", websiteLink: "https://korte.com", order: 6, isActive: true },
    { _id: "c-7", name: "Eatclub", image: "/assets/eatclub-Kr92Ly9u.png", websiteLink: "https://eatclub.com", order: 7, isActive: true },
    { _id: "c-8", name: "Town", image: "/assets/town-Byov5Sui.png", websiteLink: "", order: 8, isActive: true },
    { _id: "c-9", name: "Olanka", image: "/assets/olanka-C704RPQS.png", websiteLink: "https://olanka.com", order: 9, isActive: true },
    { _id: "c-10", name: "Nexlin", image: "/assets/nexlin-BRcx3pr3.png", websiteLink: "", order: 10, isActive: true },
    { _id: "c-11", name: "Aladal", image: "/assets/aladal-D3Ja3ziT.png", websiteLink: "", order: 11, isActive: true },
    { _id: "c-12", name: "Rich", image: "/assets/rich-CJPpOdtN.png", websiteLink: "", order: 12, isActive: true },
    { _id: "c-13", name: "Meven", image: "/assets/meven-DkVAU9li.png", websiteLink: "", order: 13, isActive: true },
    { _id: "c-14", name: "BD Hajj", image: "/assets/bdhajj-D468QQtK.png", websiteLink: "https://bdhajj.com", order: 14, isActive: true }
  ],
  themes: [
    {
      _id: "thm-1",
      websiteTitle: "BD Hajj & Umrah Agency Portal",
      slug: "bd-hajj-umrah-agency-portal",
      category: "Agency",
      price: 15000,
      discountPrice: 12000,
      websiteLink: "https://bdhajj.com",
      photo: "/assets/bdhajj-D468QQtK.png",
      popularBadge: true,
      featuredBadge: true,
      description: "Complete Hajj & Umrah agency management system with package booking, pilgrim management, visa tracking, and automated SMS notifications.",
      features: [
        "Custom responsive design for desktop and mobile",
        "Package management and direct pilgrim booking system",
        "Integrated payment gateways (bKash, Nagad, Cards)",
        "Automated visa tracking and flight schedule dashboard",
        "SEO optimized architecture with fast loading speeds"
      ],
      createdAt: "2024-01-15T10:00:00.000Z"
    },
    {
      _id: "thm-2",
      websiteTitle: "Agro Infusion - Fresh Agro eCommerce",
      slug: "agro-infusion-fresh-agro-ecommerce",
      category: "E-Commerce",
      price: 18000,
      discountPrice: 14500,
      websiteLink: "https://agroinfusion.com",
      photo: "/assets/agroinfusion-Drvh30g_.png",
      popularBadge: true,
      featuredBadge: true,
      description: "Modern, high-converting organic food and agro product eCommerce platform with inventory management, cart, checkout, and order tracking.",
      features: [
        "Modern clean UI crafted specifically for organic produce",
        "Category filters, instant live search, and stock tracking",
        "Instant checkout with cash on delivery and mobile banking",
        "Admin order management and invoice printing system",
        "SSL secured and 100% responsive"
      ],
      createdAt: "2024-02-10T10:00:00.000Z"
    },
    {
      _id: "thm-3",
      websiteTitle: "Corporate Brand & Business Portfolio",
      slug: "corporate-brand-business-portfolio",
      category: "Business",
      price: 12000,
      discountPrice: 9500,
      websiteLink: "https://okobiz.com",
      photo: "/assets/right-img-DsJocw4s.png",
      popularBadge: true,
      featuredBadge: false,
      description: "High-impact corporate portfolio with service catalog, company presentation, client testimonials, and contact lead capture system.",
      features: [
        "Sleek dark mode aesthetics with subtle animations",
        "Interactive service showcase with expandable details",
        "Case studies and clients testimonials section",
        "Direct WhatsApp and email lead capture integrations"
      ],
      createdAt: "2024-03-01T10:00:00.000Z"
    },
    {
      _id: "thm-4",
      websiteTitle: "Real Estate & Luxury Venues Booking",
      slug: "real-estate-luxury-venues-booking",
      category: "Booking",
      price: 22000,
      discountPrice: 18000,
      websiteLink: "https://venues.okobiz.com",
      photo: "/assets/VENUES-CXz5tN5L.png",
      popularBadge: false,
      featuredBadge: true,
      description: "Property and event venue reservation portal featuring date scheduling, room catalogs, pricing calculators, and interactive location maps.",
      features: [
        "Visual venue gallery and room specification sheets",
        "Real-time calendar booking and availability checker",
        "Google Maps integration with neighborhood highlights",
        "Multi-currency support and customer review module"
      ],
      createdAt: "2024-03-20T10:00:00.000Z"
    },
    {
      _id: "thm-5",
      websiteTitle: "Food & Restaurant Order App - EatClub",
      slug: "food-restaurant-order-app-eatclub",
      category: "Food",
      price: 16000,
      discountPrice: 13000,
      websiteLink: "https://eatclub.okobiz.com",
      photo: "/assets/eatclub-Kr92Ly9u.png",
      popularBadge: true,
      featuredBadge: false,
      description: "Full-featured restaurant menu, table reservation, and home delivery order application with kitchen order ticketing.",
      features: [
        "Categorized digital food menu with dietary tags",
        "Interactive cart with add-on toppings selection",
        "Delivery zone calculation and live order status",
        "Mobile-first app-like progressive web experience"
      ],
      createdAt: "2024-04-05T10:00:00.000Z"
    },
    {
      _id: "thm-6",
      websiteTitle: "Tech & Software SaaS Presentation",
      slug: "tech-software-saas-presentation",
      category: "Technology",
      price: 14000,
      discountPrice: 11000,
      websiteLink: "https://tech.okobiz.com",
      photo: "/assets/website-app-DOXr3sR7.webp",
      popularBadge: false,
      featuredBadge: true,
      description: "Cutting-edge SaaS landing page with feature deep-dives, interactive pricing toggles, integration ecosystem badges, and demo requests.",
      features: [
        "SaaS product walkthrough and feature tabs",
        "Monthly vs Annual pricing toggle calculator",
        "Modern dark UI with glowing tech badges",
        "Lead scoring and direct CRM integrations"
      ],
      createdAt: "2024-04-18T10:00:00.000Z"
    }
  ],
  blogs: [
    {
      _id: "blg-1",
      title: "Why Modern Businesses Need Custom Website & Mobile App Development",
      content: "In today's fast-paced digital ecosystem, off-the-shelf templates rarely capture the unique essence of a growing brand. Custom web and mobile app development allows organizations to engineer digital touchpoints tailored specifically to their client journeys, ensuring maximum conversion and retention.",
      category: "Web Development",
      author: "Md. Sorower Jahan",
      photo: "/assets/website-app-DOXr3sR7.webp",
      createdAt: "2024-03-12T08:30:00.000Z",
      commentsCount: 4,
      isPublished: true
    },
    {
      _id: "blg-2",
      title: "Maximizing ROI with Targeted Digital Marketing and Pixel Tracking",
      content: "Digital marketing is no longer about blindly spending advertising budget across broad channels. In 2024, data-driven targeting via Facebook Pixel, Google Tag Manager, and Demand-Side Platforms (DSP) allows brands to trace every single dollar back to revenue.",
      category: "Digital Marketing",
      author: "Anowar Hossain",
      photo: "/assets/seo-C2Lrhrz-.webp",
      createdAt: "2024-03-22T14:15:00.000Z",
      commentsCount: 2,
      isPublished: true
    },
    {
      _id: "blg-3",
      title: "The Art of Visual Storytelling: Motion Graphics & Brand Identity",
      content: "In a world of short attention spans, static visuals alone are often ignored. Dynamic motion graphics, 3D modeling, and cohesive brand identities capture attention within the first 3 seconds, conveying complex ideas effortlessly.",
      category: "Graphics Solution",
      author: "Sumiya Siddiqua",
      photo: "/assets/graphic-CV7N5QQ5.webp",
      createdAt: "2024-04-02T11:00:00.000Z",
      commentsCount: 6,
      isPublished: true
    }
  ],
  team: [
    { _id: "tm-1", name: "Md. Sorower Jahan", designation: "CEO", image: "/assets/CEO-0fmQDjG-.webp", type: "team", order: 1 },
    { _id: "tm-2", name: "Yeasmin Ara", designation: "Founder & HR admin", image: "/assets/hr mam-DEUYuDH6.webp", type: "team", order: 2 },
    { _id: "tm-3", name: "Md. Nahiduzzaman", designation: "Head of Business Development", image: "/assets/nahid sir-HBNJJFiH.webp", type: "team", order: 3 },
    { _id: "tm-4", name: "MD. Ridoy Islam Nasim", designation: "Sr. Software Engineer", image: "/assets/nasim-lv8VX_nF.webp", type: "team", order: 4 },
    { _id: "tm-5", name: "Farhan Hassan Jabil", designation: "Software Engineer", image: "/assets/farhan-BeQWWmJ1.webp", type: "team", order: 5 },
    { _id: "tm-6", name: "Ifshad Sharan", designation: "Software Engineer", image: "/assets/ifshad-Bui8Kg56.webp", type: "team", order: 6 },
    { _id: "tm-7", name: "Al Mamon", designation: "Software Engineer", image: "/assets/mamon-BuE-A5fh.webp", type: "team", order: 7 },
    { _id: "tm-8", name: "Nowrin Islam", designation: "Associate Software Engineer", image: "/assets/nowrin-BZB-MTca.webp", type: "team", order: 8 },
    { _id: "tm-9", name: "Anowar Hossain", designation: "Digital Marketer", image: "/assets/anwar-CoNwu0Ld.webp", type: "team", order: 9 },
    { _id: "tm-10", name: "Sumiya Siddiqua", designation: "Motion & Graphic Designer", image: "/assets/sumaiya-z9J32P0W.webp", type: "team", order: 10 },
    { _id: "adv-1", name: "Subir Dewan", designation: "Legal Advisor", image: "/assets/advisor-1-DYoVYteC.jpg", type: "advisor", order: 11 },
    { _id: "adv-2", name: "A.K.M Ahasunuddin", designation: "Legal Advisor", image: "/assets/advisor-2-DHZ2dHIJ.jpg", type: "advisor", order: 12 }
  ],
  services: [
    {
      _id: "srv-1",
      title: "Website, Mobile App Design & Development",
      slug: "website-app-development-service",
      image: "/assets/website-app-DOXr3sR7.webp",
      bannerImage: "/assets/web-CPDVLYNo.jpeg",
      bannerSubtitle: "Custom, scalable, and high-performance digital platforms",
      shortDesc: "We provide top-notch website and app development services tailored to your business and audience. Our expert teams design user-friendly interfaces, responsive layouts, and practical features to enhance digital interactions and maximize user satisfaction on all platforms.",
      fullDesc: "<p>okobiz offers cutting-edge website and app development services tailored to your business needs. Our expert team specializes in dynamic, user-friendly websites and mobile apps that provide seamless experiences. Whether it's e-commerce or enterprise solutions, we help you achieve your business goals with scalable and secure architectures.</p><p>From frontend interfaces engineered with React and Next.js to robust microservices powered by Node.js, Express, PostgreSQL, and MongoDB, we build software designed to withstand millions of requests while maintaining lightning-fast performance.</p>",
      icon: "Monitor",
      features: [
        "Custom Web Applications (React, Next.js)",
        "Mobile App Development (iOS, Android, Flutter)",
        "E-Commerce & Payment Gateway Integration",
        "Cloud Deployment & Microservices Architecture",
        "24/7 Dedicated Support & Code Maintenance"
      ],
      whyChooseUs: [
        { title: "Expert Team", desc: "Highly skilled developers with extensive experience in Next.js, MERN stack, Flutter, and cloud architecture." },
        { title: "Customized Solutions", desc: "Tailored to meet your specific business goals, user personas, and conversion milestones." },
        { title: "Agile Methodology", desc: "Rapid sprint cycles with regular demos, quality testing, and continuous deployment." },
        { title: "Transparent Process", desc: "Clear roadmap tracking, milestone reports, and dedicated account management." },
        { title: "Post-Development Support", desc: "Comprehensive 24/7 maintenance, server monitoring, and feature upgrades." }
      ],
      techStack: ["React", "Next.js", "TypeScript", "Node.js", "Express", "Tailwind CSS", "MongoDB", "PostgreSQL", "Flutter", "AWS", "Docker"],
      pricingPlans: [
        {
          name: "Starter Web",
          price: 15000,
          discountPrice: 20000,
          period: "One-Time Setup",
          badge: "Startup Tier",
          description: "Ideal for small businesses needing a high-speed corporate presence.",
          features: [
            "Custom UI/UX Design & Branding",
            "5 Core High-Converting Pages",
            "100% Mobile & Tablet Responsive",
            "Contact Form & Direct WhatsApp Integration",
            "Speed Optimization & Basic SEO",
            "1 Month Free Technical Support"
          ],
          isPopular: false
        },
        {
          name: "Business Full-Stack",
          price: 35000,
          discountPrice: 45000,
          period: "One-Time Setup",
          badge: "Most Popular",
          description: "Full-stack web application with dynamic dashboard and database.",
          features: [
            "Next.js 14 & Node.js Custom Architecture",
            "Interactive Admin Dashboard & CMS",
            "MongoDB / PostgreSQL Database Integration",
            "Secure User Authentication & RBAC",
            "Online Payment Gateway (bKash/Nagad/SSL)",
            "95+ Google PageSpeed Score",
            "3 Months Dedicated Support & Backups"
          ],
          isPopular: true
        },
        {
          name: "Enterprise Ecosystem",
          price: 75000,
          discountPrice: 95000,
          period: "One-Time Setup",
          badge: "Scalable SaaS",
          description: "High-concurrency web & mobile app ecosystem with cloud infrastructure.",
          features: [
            "Complete Web App + Cross-Platform Mobile App (Flutter)",
            "Microservices Backend & Scalable REST/GraphQL APIs",
            "Real-Time WebSockets & Push Notifications",
            "Automated CI/CD Deployment Pipeline on AWS/Docker",
            "Enterprise Grade Data Encryption & Auditing",
            "Dedicated Senior Project Manager",
            "6 Months Priority SLA Maintenance"
          ],
          isPopular: false
        }
      ],
      order: 1
    },
    {
      _id: "srv-2",
      title: "Seo And Website Development",
      slug: "seo-website-development-service",
      image: "/assets/seo-C2Lrhrz-.webp",
      bannerImage: "/assets/seo-2-Chqa_ILp.png",
      bannerSubtitle: "Rank higher on Google, drive organic traffic, and accelerate customer conversion",
      shortDesc: "We specialize in expert digital marketing consultation, customized for your business, location, and target audience. Our comprehensive services encompass website management and SEO, aimed at boosting online presence, enhancing search rankings, improving user experience, and optimizing performance through targeted keywords and content updates.",
      fullDesc: "<p>Dominate search engine rankings with okobiz's end-to-end SEO and website optimization services. We conduct deep technical site audits, keyword competitor analysis, on-page optimization, and high-authority link-building strategies.</p><p>Our developers ensure your website scores 95+ on Google PageSpeed Insights with core web vitals optimization, structured data schemas, and lightning-fast loading speeds.</p>",
      icon: "Search",
      features: [
        "Technical SEO & Core Web Vitals Optimization",
        "Keyword Research & High-Intent Strategy",
        "On-Page Optimization & Semantic HTML Hierarchy",
        "Local Google Business Profile Ranking",
        "Competitor Gap Analysis & Link Building"
      ],
      whyChooseUs: [
        { title: "Data-Driven Strategy", desc: "We base every decision on search intent analytics and live ranking signals." },
        { title: "Sustainable Rankings", desc: "100% white-hat SEO techniques that protect your domain against algorithm updates." },
        { title: "Transparent Monthly Reports", desc: "Detailed keyword movement and traffic attribution reports every 30 days." }
      ],
      techStack: ["Google Search Console", "Google Analytics", "Ahrefs", "SEMrush", "Screaming Frog", "Schema Markup"],
      pricingPlans: [
        {
          name: "Local Growth SEO",
          price: 10000,
          discountPrice: 14000,
          period: "/ month",
          badge: "Starter",
          description: "Rank for local search queries and establish Google visibility.",
          features: [
            "Complete Technical Site Health Audit",
            "10 High-Intent Target Keywords",
            "Google Search Console & Analytics 4 Setup",
            "Google Business Profile Optimization",
            "Title, Meta & Heading Schema Fixes",
            "Monthly Ranking & Traffic Report"
          ],
          isPopular: false
        },
        {
          name: "National Authority SEO",
          price: 22000,
          discountPrice: 30000,
          period: "/ month",
          badge: "Most Popular",
          description: "Accelerate organic search traffic and outperform major competitors.",
          features: [
            "30 High-Volume Target Keywords",
            "Core Web Vitals & Page Speed Fixes",
            "High-DA Quality Backlink Outreach",
            "Competitor Keyword Gap Interception",
            "2 Monthly SEO-Optimized Blog Articles",
            "Bi-Weekly Progress & Keyword Movement Calls"
          ],
          isPopular: true
        },
        {
          name: "Enterprise Search Dominance",
          price: 45000,
          discountPrice: 60000,
          period: "/ month",
          badge: "Market Leader",
          description: "Full-scale corporate SEO strategy for high-volume revenue generation.",
          features: [
            "60+ National & International Commercial Keywords",
            "Advanced Structured Data (JSON-LD) Hierarchy",
            "Aggressive Editorial Link Building & PR Distribution",
            "Conversion Rate Optimization (CRO) Recommendations",
            "4 Monthly Long-Form Expert Content Pieces",
            "Dedicated Senior SEO Strategist & 24/7 Monitoring"
          ],
          isPopular: false
        }
      ],
      order: 2
    },
    {
      _id: "srv-3",
      title: "Consultancy On Digital Marketing",
      slug: "digital-marketing-service",
      image: "/assets/digital-4ufNPyE6.webp",
      bannerImage: "/assets/digital-2-snBkV2Qy.jpeg",
      bannerSubtitle: "Data-driven campaigns, retargeting pixels, and search engine dominance",
      shortDesc: "Our specialized digital marketing consultation is customized to fit your business, location, and target audience perfectly. We analyze strategies, audiences, and trends to optimize your marketing approach. With tailored plans, we ensure effective messaging, resource allocation, and robust online growth. Contact us today to begin maximizing your digital presence!",
      fullDesc: "<p>Accelerate your brand growth with data-backed digital marketing campaigns engineered for high conversion rates. We design multi-channel acquisition funnels spanning Facebook, Instagram, Google Ads, LinkedIn, and programmatic display networks.</p><p>By integrating pixel tracking, server-side conversion APIs, and custom CRM attribution, we ensure your ad budget delivers measurable ROI and sustainable pipeline growth.</p>",
      icon: "BarChart",
      features: [
        "PPC & Google Ads Campaign Management",
        "Meta & TikTok High-Converting Ad Creative",
        "Server-Side Facebook Pixel & Conversion API",
        "Email & SMS Automated Retargeting Funnels",
        "Conversion Rate Optimization (CRO)"
      ],
      whyChooseUs: [
        { title: "Targeted Precision", desc: "Laser-focused audience segments tailored to buyer personas." },
        { title: "Maximized Ad Spend ROI", desc: "Continuous A/B testing of creatives and bid strategies to lower CPA." },
        { title: "Full-Funnel Tracking", desc: "End-to-end analytics from first impression to verified purchase." }
      ],
      techStack: ["Meta Ads Manager", "Google Ads", "TikTok Ads", "Google Tag Manager", "Mailchimp", "Klaviyo"],
      pricingPlans: [
        {
          name: "Ad Campaign Starter",
          price: 12000,
          discountPrice: 16000,
          period: "/ month",
          badge: "Lead Gen",
          description: "Launch targeted ads with verified tracking and lead capture.",
          features: [
            "Meta Ads (Facebook & Instagram) Setup",
            "Ad Spend Management up to $600/month",
            "4 Custom Static Ad Creatives & Copywriting",
            "Audience Targeting & Demographics Setup",
            "Basic Pixel & Lead Generation Funnel"
          ],
          isPopular: false
        },
        {
          name: "Growth Performance Marketing",
          price: 25000,
          discountPrice: 35000,
          period: "/ month",
          badge: "High Conversion",
          description: "Multi-channel funnel with retargeting and automated tracking.",
          features: [
            "Meta Ads + Google Search & YouTube Ads",
            "Ad Spend Management up to $2,500/month",
            "10 High-Converting Creatives + 2 Motion Ads",
            "Server-Side Facebook Conversion API (CAPI)",
            "Dynamic Retargeting & Cart Abandonment Funnels",
            "Continuous A/B Testing & Weekly CPA Optimization"
          ],
          isPopular: true
        },
        {
          name: "Omnichannel Scale",
          price: 50000,
          discountPrice: 65000,
          period: "/ month",
          badge: "Aggressive Scale",
          description: "Full-scale advertising suite across all major digital channels.",
          features: [
            "Meta, Google, TikTok, LinkedIn & Display Advertising",
            "Unlimited Ad Spend Management",
            "Custom Creative Sprint (Videos, Reels & Carousels)",
            "CRM & WhatsApp Automation Integration",
            "Full-Funnel ROAS & Attribution Modeling",
            "Dedicated Media Buyer & Weekly Strategy Meetings"
          ],
          isPopular: false
        }
      ],
      order: 3
    },
    {
      _id: "srv-4",
      title: "Creative Graphic Solution",
      slug: "graphics-solution-service",
      image: "/assets/graphic-CV7N5QQ5.webp",
      bannerImage: "/assets/graphic-2-C80LdtU9.jpeg",
      bannerSubtitle: "Visual identity, motion design, and high-impact branding",
      shortDesc: "We elevate your online presence by seamlessly integrating creative graphics into your virtual platforms. Our innovative graphic solutions deliver captivating visual concepts that effectively convey messages through inventive design, enhancing brand recognition and driving engagement.",
      fullDesc: "<p>Visuals define how customers perceive your company within the first second. okobiz provides comprehensive creative graphic solutions, from memorable corporate logos and brand guidelines to dynamic 3D motion graphics and print collateral.</p><p>Our creative team blends modern aesthetics with persuasive visual psychology to elevate your brand prestige across digital and physical mediums.</p>",
      icon: "PenTool",
      features: [
        "Logo Design & Complete Brand Identity Kit",
        "Poster, Banner & Digital Marketing Creatives",
        "Social Media Kits & Carousel Post Systems",
        "Print Materials (Brochures, Catalog, Packaging)",
        "Motion Graphics, 3D Renders & UI/UX Figma Mockups"
      ],
      whyChooseUs: [
        { title: "Award-Winning Aesthetics", desc: "Distinctive, memorable designs tailored to your corporate vision." },
        { title: "Ready-To-Use Formats", desc: "Full vector, print-ready CMYK, and web-optimized asset delivery." },
        { title: "Rapid Turnaround", desc: "Quick conceptualization sprints with unlimited collaborative revisions." }
      ],
      techStack: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "After Effects", "Blender 3D", "InDesign"],
      pricingPlans: [
        {
          name: "Brand Starter Kit",
          price: 8000,
          discountPrice: 12000,
          period: "One-Time Setup",
          badge: "Identity",
          description: "Essential corporate identity package for launching your brand.",
          features: [
            "3 Unique Logo Design Concepts",
            "Brand Color Palette & Typography System",
            "High-Resolution Vector Files (AI, SVG, PNG, PDF)",
            "Social Media Profile & Cover Assets",
            "Unlimited Conceptual Revisions"
          ],
          isPopular: false
        },
        {
          name: "Complete Corporate Identity",
          price: 18000,
          discountPrice: 25000,
          period: "One-Time Setup",
          badge: "Most Popular",
          description: "Full brand guidelines and corporate collateral suite.",
          features: [
            "Comprehensive Brand Guidelines Manual (PDF)",
            "Full Stationery Suite (Business Cards, Letterhead, Envelopes)",
            "10 Social Media Marketing Templates (Canva & PSD)",
            "Company Profile & Brochure Layout (up to 8 pages)",
            "Packaging or Merchandise Mockup Designs",
            "Full Commercial Copyright Transfer"
          ],
          isPopular: true
        },
        {
          name: "Master Agency Creative Suite",
          price: 38000,
          discountPrice: 50000,
          period: "One-Time Setup",
          badge: "Premium Design",
          description: "3D renders, UI/UX Figma design system, and motion graphics.",
          features: [
            "Full Corporate Brand Identity Ecosystem",
            "3D Product Modeling & Photorealistic Renders",
            "Motion Graphics Logo Intro & Promo Video",
            "Complete Web/App UI Design System in Figma",
            "Investor Pitch Deck / Catalog Presentation",
            "Dedicated Senior Art Director"
          ],
          isPopular: false
        }
      ],
      order: 4
    },
    {
      _id: "srv-5",
      title: "Social Media Management",
      slug: "social-media-management-service",
      image: "/assets/social-WzytKsh-.webp",
      bannerImage: "/assets/clientsfotter-o_Y4RCBU.webp",
      bannerSubtitle: "Engaging social storytelling, community moderation, and brand loyalty",
      shortDesc: "We specialize in offering superior website and app development services customized for your business, location, and target audience. Our collaborative design and development teams create user-friendly interfaces, responsive layouts, and practical features, enhancing digital interactions and maximizing user satisfaction across websites and mobile apps.",
      fullDesc: "<p>Build an active, loyal community around your brand with okobiz's complete social media management services. We handle content calendar planning, graphic creation, reels/shorts production, copywriting, and daily audience engagement.</p><p>From LinkedIn thought leadership to viral TikTok and Instagram campaigns, we keep your brand at the forefront of your industry.</p>",
      icon: "Share2",
      features: [
        "Monthly Content Calendar Strategy",
        "Short-Form Video Production (Reels & TikToks)",
        "Daily Community Engagement & DM Management",
        "Influencer Outreach & Strategic Collabs",
        "Monthly Reach, Sentiment & Growth Analytics"
      ],
      whyChooseUs: [
        { title: "Consistent Brand Voice", desc: "Harmonious messaging and visuals across all social touchpoints." },
        { title: "Active Community Nurturing", desc: "Fast response times to comments and inquiries to build trust." },
        { title: "Trend Jacking", desc: "Capitalizing on viral cultural trends to boost organic reach." }
      ],
      techStack: ["Canva", "CapCut", "Buffer", "Hootsuite", "Meta Business Suite", "LinkedIn Campaign Mgr"],
      pricingPlans: [
        {
          name: "Essential Presence",
          price: 12000,
          discountPrice: 16000,
          period: "/ month",
          badge: "Starter",
          description: "Maintain a polished, regular social media voice across platforms.",
          features: [
            "12 Custom Designed Graphics & Infographics",
            "Engaging Caption Writing & Hashtag Research",
            "Scheduled Publishing across Facebook & Instagram",
            "Community Comment & Message Monitoring",
            "Monthly Engagement & Reach Summary"
          ],
          isPopular: false
        },
        {
          name: "Engagement & Viral Reach",
          price: 24000,
          discountPrice: 32000,
          period: "/ month",
          badge: "Most Popular",
          description: "Video-focused social growth with daily engagement and stories.",
          features: [
            "20 High-Quality Visual Posts + Carousels",
            "4 Edited Short-Form Reels / TikTok Videos",
            "Daily Story Highlights & Polls",
            "Proactive Community Building & Fast DM Replies",
            "Influencer Collaboration Outreach",
            "Bi-Weekly Analytics & Strategy Adjustments"
          ],
          isPopular: true
        },
        {
          name: "Total Brand Dominance",
          price: 45000,
          discountPrice: 60000,
          period: "/ month",
          badge: "Full Production",
          description: "End-to-end social media handling with on-brand video production.",
          features: [
            "30 Premium Custom Graphics & Carousels",
            "10 High-Impact Reels/Shorts with Voiceover & Motion",
            "Multi-Platform Management (FB, IG, LinkedIn, TikTok)",
            "24/7 Community Moderation & Lead Capture",
            "Monthly Paid Boost Budget Strategy",
            "Dedicated Social Media Manager & Copywriter"
          ],
          isPopular: false
        }
      ],
      order: 5
    },
    {
      _id: "srv-6",
      title: "Digital Advertising & DSP",
      slug: "digital-advertising-dsp-service",
      image: "/assets/advertising-AjUZBcZg.webp",
      bannerImage: "/assets/about-33-B_PGTXVg.webp",
      bannerSubtitle: "Programmatic ad buying, demand-side platforms, and global reach",
      shortDesc: "Businesses can effectively target and manage online ad campaigns, optimize ad spend, and reach their desired demographic with precision through digital advertising and DSP (Demand-Side Platform) services. Explore the optimal solution at okobiz.",
      fullDesc: "<p>Take your advertising beyond walled gardens with Demand-Side Platform (DSP) programmatic advertising. okobiz leverages real-time bidding (RTB) to deliver high-impact display, native, audio, and connected TV (CTV) ads across premium publisher networks globally.</p><p>Optimize CPM, avoid ad fraud, and reach hyper-targeted audiences with first-party data onboarding and behavioral tracking.</p>",
      icon: "Tv",
      features: [
        "Programmatic RTB Media Buying & Management",
        "Connected TV (CTV) & Digital Audio Ads",
        "First-Party Data Audience Onboarding",
        "Cross-Device Retargeting & Frequency Capping",
        "Brand Safety & Anti-Fraud Real-Time Filters"
      ],
      whyChooseUs: [
        { title: "Global Inventory Access", desc: "Access top-tier publisher inventory across millions of websites and apps." },
        { title: "Hyper-Precise Geo & Demographics", desc: "Target down to specific zip codes, device types, and interests." },
        { title: "Cost-Efficient CPMs", desc: "Algorithmic bidding ensures you never overpay for ad impressions." }
      ],
      techStack: ["Google Display & Video 360", "The Trade Desk", "Amazon DSP", "AdForm", "Moat Analytics"],
      pricingPlans: [
        {
          name: "DSP Programmatic Starter",
          price: 20000,
          discountPrice: 28000,
          period: "/ month",
          badge: "Display RTB",
          description: "Real-time bidding across top global websites and news publishers.",
          features: [
            "DSP Platform Setup & Campaign Architecture",
            "Standard IAB Display Banner Formats",
            "Geo-Fencing & Demographic Audience Targeting",
            "Real-Time Anti-Fraud & Brand Safety Filters",
            "Monthly Impression & CTR Attribution Report"
          ],
          isPopular: false
        },
        {
          name: "Advanced Video & CTV DSP",
          price: 40000,
          discountPrice: 55000,
          period: "/ month",
          badge: "Most Popular",
          description: "Connected TV, digital audio, and high-impact rich media.",
          features: [
            "Connected TV (CTV) & OTT Video Ad Placement",
            "Digital Audio Advertising (Spotify, Podcasts)",
            "First-Party CRM Data Audience Matching",
            "Cross-Device Frequency Capping & Sequential Retargeting",
            "Viewability Verification (Moat / IAS Integration)",
            "Bi-Weekly Optimization & Inventory Refinement"
          ],
          isPopular: true
        },
        {
          name: "Global Enterprise Omnichannel DSP",
          price: 80000,
          discountPrice: 110000,
          period: "/ month",
          badge: "Global Scale",
          description: "Multi-DSP orchestration with customized algorithmic bidding.",
          features: [
            "Multi-DSP Orchestration (Google DV360 & The Trade Desk)",
            "Custom Algorithmic Bidding Models",
            "Global Publisher PMP (Private Marketplace) Deals",
            "Omnichannel Dynamic Creative Optimization (DCO)",
            "Advanced Multi-Touch Attribution Modeling",
            "Dedicated Certified Programmatic Trader"
          ],
          isPopular: false
        }
      ],
      order: 6
    }
  ],
  faqs: [
    { _id: "faq-1", question: "What services does okobiz provide?", answer: "okobiz provides end-to-end digital solutions including Website & Web App Development, Mobile Applications (Flutter, React Native, iOS, Android), UI/UX Design, Motion Graphics, Branding, and Data-Driven Digital Marketing.", category: "General", order: 1 },
    { _id: "faq-2", question: "How can I start a project with okobiz?", answer: "You can click 'Get In Touch' or contact us via WhatsApp (+880 1973-590937) or email (info@okobiz.com). Our team will schedule a discovery call to discuss your specifications and provide a custom quote.", category: "Process", order: 2 },
    { _id: "faq-3", question: "Do you offer post-launch maintenance and support?", answer: "Yes! Every project includes dedicated warranty support, bug fixes, performance monitoring, security updates, and flexible monthly maintenance retainers.", category: "Support", order: 3 },
    { _id: "faq-4", question: "What is your typical project timeline?", answer: "Timelines depend on project complexity: standard corporate websites typically take 2-3 weeks, custom web apps take 4-8 weeks, and full mobile applications take 6-12 weeks.", category: "Timeline", order: 4 }
  ],
  media: [
    { _id: "med-1", name: "Okobiz Logo", filename: "okobiz-logo-C_Tt48xb.png", path: "/assets/okobiz-logo-C_Tt48xb.png", type: "image", size: 45200, mimeType: "image/png", url: "/assets/okobiz-logo-C_Tt48xb.png", createdAt: "2024-01-01T00:00:00.000Z" },
    { _id: "med-2", name: "Company Brochure Profile 2024", filename: "okobiz_company_profile_2024.pdf", path: "/assets/okobiz_company_profile.pdf", type: "pdf", size: 1845000, mimeType: "application/pdf", url: "/assets/okobiz_company_profile.pdf", createdAt: "2024-02-15T00:00:00.000Z" },
    { _id: "med-3", name: "Okobiz Corporate Showreel Demo", filename: "okobiz_corporate_reel.mp4", path: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", type: "video", size: 0, mimeType: "video/mp4", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", createdAt: "2024-03-01T00:00:00.000Z" }
  ],
  gallery: [
    { _id: "gal-1", title: "Annual Tech Innovation Summit & Award Ceremony", category: "Achievements", imageUrl: "/assets/about-33-B_PGTXVg.webp", description: "Celebrating our milestones and stellar client success stories.", order: 1, featured: true, createdAt: "2024-01-10T10:00:00.000Z" },
    { _id: "gal-2", title: "okobiz Core Engineering & Creative Team", category: "Team Moments", imageUrl: "/assets/clientsfotter-o_Y4RCBU.webp", description: "Collaboration and team unity at the heart of our software architecture.", order: 2, featured: true, createdAt: "2024-02-14T10:00:00.000Z" },
    { _id: "gal-3", title: "Creative Brainstorming & UI/UX Design Sprint", category: "Office Life", imageUrl: "/assets/about-BPfvng5e.webp", description: "Designing intuitive client experiences, wireframes, and modern concepts.", order: 3, featured: false, createdAt: "2024-03-05T10:00:00.000Z" },
    { _id: "gal-4", title: "High-Performance Web Architecture Session", category: "Projects", imageUrl: "/assets/web-2-DujjTO8C.webp", description: "Deep dive into Next.js server components and distributed backends.", order: 4, featured: true, createdAt: "2024-04-12T10:00:00.000Z" },
    { _id: "gal-5", title: "Motion Graphics & 3D Visual Rendering Lab", category: "Projects", imageUrl: "/assets/graphic-2-C80LdtU9.jpeg", description: "Crafting micro-animations, 3D brand visuals, and digital promotional assets.", order: 5, featured: false, createdAt: "2024-05-18T10:00:00.000Z" },
    { _id: "gal-6", title: "Digital Marketing Strategy & Conversion Workshop", category: "Events", imageUrl: "/assets/digital-2-snBkV2Qy.jpeg", description: "Audience analytics, conversion rate optimization, and ad campaigns analysis.", order: 6, featured: false, createdAt: "2024-06-20T10:00:00.000Z" }
  ],
  products: [
    {
      _id: "prod-1",
      title: "PharmaCare Pro - Pharmacy Management System",
      slug: "prod-1",
      tagline: "Complete Cloud Pharmacy & Medical Store POS, Batch Expiry Tracker, Generic Drug Search & Accounting ERP",
      category: "Healthcare & Pharmacy",
      mediaType: "video",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      images: [
        "/assets/web-2-DujjTO8C.webp",
        "/assets/about-BPfvng5e.webp",
        "/assets/about-33-B_PGTXVg.webp"
      ],
      video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoThumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      description: "<h2>Enterprise Pharmacy Management System (PharmaCare Pro)</h2><p>PharmaCare Pro is an all-in-one, highly scalable SaaS software designed specifically for retail pharmacies, pharmacy chains, and hospital drug dispensaries. Eliminate medicine expiry losses, streamline supplier procurement, and accelerate checkout with instant barcode POS billing.</p><h3>Key Business Capabilities:</h3><ul><li><strong>Intelligent Batch & Expiry Alert:</strong> Automatic advance warnings before medicines reach expiration date, preventing inventory waste.</li><li><strong>Generic Alternative Lookup:</strong> Instant generic substitute suggestion when a branded drug is out of stock.</li><li><strong>High-Speed Barcode POS:</strong> Fast checkout billing with thermal receipt printers, itemized VAT, and customer change calculators.</li><li><strong>Supplier & Purchase Ledger:</strong> Track drug purchase orders, payment terms, and vendor return vouchers effortlessly.</li><li><strong>Complete Financial Accounting:</strong> Daily cash register reconciliation, profit-and-loss reports, and stock valuation audits.</li></ul>",
      features: [
        "Automated Batch & Expiry Date Alert",
        "Generic Brand Recommendation System",
        "High-Speed Barcode & Thermal POS Billing",
        "Supplier Purchase Ledger & Return System",
        "Role-Based User Permissions (Cashier/Admin)",
        "Daily Cash Drawer & Profit-Loss Analytics"
      ],
      pricingPlans: [
        {
          name: "Starter Pharmacy",
          price: 15000,
          discountPrice: 20000,
          period: "One-Time Setup",
          badge: "Single Store",
          description: "Ideal for independent retail pharmacies and individual medicine dispensaries.",
          features: [
            "Single Counter POS Terminal",
            "Unlimited Medicines & Batches",
            "Batch & Expiry Date Tracking",
            "Thermal Receipt Printing",
            "Daily Sales & Profit Reports",
            "1 Year Free Cloud Hosting & Backups",
            "Free Onboarding & Data Migration"
          ],
          isPopular: false
        },
        {
          name: "Professional Pro",
          price: 28000,
          discountPrice: 35000,
          period: "One-Time Setup",
          badge: "Most Popular",
          description: "The complete standard for busy retail pharmacies with multiple billing counters.",
          features: [
            "Up to 3 Billing Counters",
            "Customer Due/Credit Ledger & SMS Alert",
            "Generic Drug Search & Alternate Lookup",
            "Supplier Purchase & Return Invoicing",
            "Damage & Expired Drug Write-Off Module",
            "Lifetime Software License",
            "Priority WhatsApp Support (24/7)"
          ],
          isPopular: true
        },
        {
          name: "Enterprise Multi-Branch",
          price: 55000,
          discountPrice: 70000,
          period: "One-Time Setup",
          badge: "Multi-Store",
          description: "Engineered for pharmacy chains and central warehouse medicine distributors.",
          features: [
            "Unlimited Branches & Central Warehouse",
            "Inter-Branch Stock Transfer & Approvals",
            "Custom Branded Android/Web Dashboard",
            "Automated Multi-Branch Cloud Sync",
            "Advanced Multi-Level Staff Roles",
            "Dedicated Account Manager",
            "On-site Staff Training & Full Customization"
          ],
          isPopular: false
        }
      ],
      reviews: [
        {
          name: "Dr. Rafiqul Islam",
          designation: "Managing Director",
          company: "Al-Madina Pharma Care Ltd.",
          location: "Dhaka",
          rating: 5,
          comment: "PharmaCare Pro completely eliminated our medicine expiry losses. The automatic advance alerts and barcode POS billing have made our checkout 3x faster. Outstanding software!",
          tag: "Pharmacy ERP"
        },
        {
          name: "Engr. Nazmul Huda",
          designation: "General Manager",
          company: "CarePlus Healthcare Diagnostics",
          location: "Chittagong",
          rating: 5,
          comment: "okobiz team deployed our full clinic and lab dispensary system in less than 48 hours. Direct WhatsApp support responds within minutes whenever we need anything.",
          tag: "Healthcare SaaS"
        }
      ],
      liveUrl: "https://okobiz.com/demo",
      whatsappNumber: "+8801973590937",
      popularBadge: true,
      featuredBadge: true,
      order: 1,
      status: "active",
      createdAt: "2024-03-01T10:00:00.000Z"
    },
    {
      _id: "prod-2",
      title: "RestoMaster - Restaurant POS & Cloud Kitchen ERP",
      slug: "prod-2",
      tagline: "Modern Dine-In, Table QR Ordering, Kitchen Display System (KDS), Parcel POS & Multi-Branch Cloud Management",
      category: "Restaurant & Food",
      mediaType: "image",
      thumbnail: "/assets/about-BPfvng5e.webp",
      images: [
        "/assets/about-BPfvng5e.webp",
        "/assets/web-2-DujjTO8C.webp",
        "/assets/clientsfotter-o_Y4RCBU.webp"
      ],
      video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoThumbnail: "/assets/about-BPfvng5e.webp",
      description: "<h2>Complete Restaurant POS & Management System (RestoMaster)</h2><p>RestoMaster is built to deliver fast, mistake-free dining service for cafes, fine dining restaurants, fast-food outlets, and cloud kitchens. From table reservation to kitchen token generation and automated VAT billing, manage everything from any device.</p><h3>Why Leading Restaurants Trust RestoMaster:</h3><ul><li><strong>Interactive Floor Plan & Table Management:</strong> Real-time visual table occupancy, waiter order taking, and bill splitting.</li><li><strong>Kitchen Display System (KDS) & KOT:</strong> Instant kitchen ticket printing or screen display directly on kitchen tablets.</li><li><strong>Menu & Recipe Food Costing:</strong> Track raw ingredient usage (meat, oil, vegetables) with every food order to prevent wastage.</li><li><strong>Online Delivery Aggregator Integration:</strong> Centralize dine-in, takeaway, and delivery orders into a unified dashboard.</li><li><strong>Daily Shift & Cash Drawer Closeout:</strong> Detailed daily register settlement reports with cash, card, and mobile banking reconciliation.</li></ul>",
      features: [
        "Live Table Management & Floor Plan",
        "Kitchen Order Token (KOT) & KDS Screen",
        "Takeaway & Home Delivery Dispatch",
        "Recipe & Raw Ingredient Stock Control",
        "Waiter Mobile Tablet App Support",
        "Daily Register Cash Reconciliations"
      ],
      pricingPlans: [
        {
          name: "Cafe & Takeaway",
          price: 14000,
          discountPrice: 18000,
          period: "One-Time Setup",
          badge: "Starter",
          description: "Ideal for coffee shops, bakeries, food trucks, and small quick-service eateries.",
          features: [
            "1 Cashier Billing Counter",
            "Instant KOT Ticket Printing",
            "Takeaway & Dine-in Support",
            "Thermal Receipt Customization with Logo",
            "Daily Shift Sales Summary",
            "Lifetime License with No Monthly Fees",
            "Online Setup & Configuration"
          ],
          isPopular: false
        },
        {
          name: "Full Restaurant Pro",
          price: 26000,
          discountPrice: 34000,
          period: "One-Time Setup",
          badge: "Most Popular",
          description: "The complete powerhouse for dine-in restaurants, buffet halls, and busy cafes.",
          features: [
            "Unlimited Dining Tables & Floor Layout",
            "Waiter Tablet Ordering Interface",
            "Kitchen Display System (KDS) Screen",
            "Recipe Ingredient Deductions & Inventory",
            "Split Bill & Discount Coupons",
            "Customer Loyalty & Birthday SMS",
            "24/7 Dedicated Support Hotline"
          ],
          isPopular: true
        },
        {
          name: "Franchise & Cloud Kitchens",
          price: 48000,
          discountPrice: 62000,
          period: "One-Time Setup",
          badge: "Enterprise",
          description: "Built for multi-location restaurant chains, central kitchens, and food franchises.",
          features: [
            "Multi-Outlet Centralized Dashboard",
            "Central Commissary Raw Material Dispatches",
            "Aggregator Orders Central Hub",
            "Consolidated Group Financial Auditing",
            "Custom Mobile App for Brand Ordering",
            "Dedicated Software Engineer Support",
            "On-site Staff Training Included"
          ],
          isPopular: false
        }
      ],
      reviews: [
        {
          name: "Tanvir Ahmed",
          designation: "Founder & Owner",
          company: "The Smokehouse Grill & Cafe",
          location: "Gulshan",
          rating: 5,
          comment: "The table management and kitchen display (KDS) system transformed our dining service. Zero order mistakes and daily cash register reconciliation is seamless.",
          tag: "Restaurant POS"
        },
        {
          name: "Farhan Kabir",
          designation: "Managing Partner",
          company: "Taste of Italy Trattoria",
          location: "Banani",
          rating: 5,
          comment: "Recipe costing and ingredient tracking helped us cut food wastage by 22% in our very first month. Highly recommended for any restaurant owner.",
          tag: "Cloud Kitchen ERP"
        }
      ],
      liveUrl: "https://okobiz.com/demo",
      whatsappNumber: "+8801973590937",
      popularBadge: true,
      featuredBadge: true,
      order: 2,
      status: "active",
      createdAt: "2024-03-05T10:00:00.000Z"
    },
    {
      _id: "prod-3",
      title: "ShopFlow Pro - Supermarket & Retail POS ERP",
      slug: "prod-3",
      tagline: "High-Speed Barcode Billing, Multi-Warehouse Inventory, Customer Loyalty & Accounting ERP",
      category: "Retail & Supermarket",
      mediaType: "image",
      thumbnail: "/assets/about-33-B_PGTXVg.webp",
      images: [
        "/assets/about-33-B_PGTXVg.webp",
        "/assets/web-2-DujjTO8C.webp"
      ],
      video: "",
      videoThumbnail: "",
      description: "<h2>Complete Retail POS & Supermarket Inventory ERP (ShopFlow Pro)</h2><p>ShopFlow Pro powers modern retail outlets, supermarkets, electronics stores, and fashion boutiques. Built with blazingly fast scanning, offline-resilient billing, and comprehensive accounts management.</p><h3>Features that Accelerate Retail Growth:</h3><ul><li><strong>Fast Scanning & Shortcut Keys:</strong> Process up to 10 customers per minute with lightning-fast barcode barcode scanning.</li><li><strong>Automated Stock Re-order Alert:</strong> Get notified before items run out of stock with automatic purchase order recommendations.</li><li><strong>Customer Credit Ledger & Due Collection:</strong> Complete customer ledger with SMS reminders for pending dues.</li><li><strong>Barcode Label Generator:</strong> Print customized barcode stickers with price, item code, and store name directly from the software.</li></ul>",
      features: [
        "Ultra-Fast Barcode Scanning & Offline Mode",
        "Barcode Label Generator & Sticker Printing",
        "Supplier Purchase Orders & Payment Ledgers",
        "Customer Credit (Due) Ledger with SMS",
        "Multi-Unit Support (Pcs, Kg, Box, Pack)",
        "Automated Profit, Loss & VAT Reports"
      ],
      pricingPlans: [
        {
          name: "Single Store Standard",
          price: 12000,
          discountPrice: 16000,
          period: "One-Time Setup",
          badge: "Standard",
          description: "Perfect for grocery stores, boutiques, electronics shops, and department stores.",
          features: [
            "1 Billing POS Terminal",
            "Unlimited Products & Barcodes",
            "Barcode Sticker Generator",
            "Customer Due & Credit Tracking",
            "Daily & Monthly Sales Analytics",
            "Lifetime License Included",
            "Free Remote Installation"
          ],
          isPopular: false
        },
        {
          name: "Multi-Counter Pro",
          price: 24000,
          discountPrice: 30000,
          period: "One-Time Setup",
          badge: "Most Popular",
          description: "Tailored for high-footfall supermarkets and department stores with several cashiers.",
          features: [
            "Up to 4 Billing Counters",
            "Cashier Shift Reconciliations",
            "Automated Low-Stock Alerts",
            "SMS Bill Confirmation & Marketing",
            "Supplier Ledger & Aging Reports",
            "Cloud Backup Auto-Sync",
            "24/7 Priority WhatsApp Support"
          ],
          isPopular: true
        },
        {
          name: "Chain Store Enterprise",
          price: 45000,
          discountPrice: 58000,
          period: "One-Time Setup",
          badge: "Enterprise",
          description: "For retail brand chains with centralized warehouse purchasing and distribution.",
          features: [
            "Multi-Branch Central Inventory",
            "Central Purchasing & Stock Transfers",
            "Customer Global Loyalty Rewards Card",
            "Executive Business Intelligence Dashboard",
            "Role-Based Access Management",
            "Dedicated Support Account Manager",
            "On-site Setup & Staff Training"
          ],
          isPopular: false
        }
      ],
      reviews: [
        {
          name: "Shahidul Alam",
          designation: "Operations Head",
          company: "MegaMart Retail Chain",
          location: "Uttara",
          rating: 5,
          comment: "ShopFlow Pro handles our 4 cashier counters during peak rush without a single freeze. The customer due SMS notifications increased our collections significantly.",
          tag: "Supermarket ERP"
        }
      ],
      liveUrl: "https://okobiz.com/demo",
      whatsappNumber: "+8801973590937",
      popularBadge: false,
      featuredBadge: true,
      order: 3,
      status: "active",
      createdAt: "2024-03-10T10:00:00.000Z"
    }
  ],
  inquiries: [
    { _id: "inq-1", name: "Tanvir Ahmed", email: "tanvir@techcorp.com", phone: "+8801812345678", service: "Website & App Development", message: "We need an enterprise ERP portal and mobile application for our distribution network.", status: "new", createdAt: "2024-04-10T12:00:00.000Z" },
    { _id: "inq-2", name: "Sarah Jenkins", email: "sarah@ukevents.co.uk", phone: "+447911123456", service: "Creative Solution", message: "Looking for complete rebranding and 3D animated promotional video for our upcoming summit.", status: "in_progress", createdAt: "2024-04-12T14:30:00.000Z" }
  ],
  settings: {
    siteName: "okobiz",
    contactPhone: "01973-590937",
    contactEmail: "info@okobiz.com",
    contactAddress: "House-24, Road-14, Sector-11, Uttara, Dhaka, Bangladesh",
    whatsappNumber: "+8801973590937",
    stats: {
      journeyStarted: "2018",
      happyClients: "150",
      teamMembers: "20",
      yearsOfExcellence: "6+"
    },
    portfolioPdf: {
      heading: "okobiz Official Profile & Credentials 2024",
      subheading: "Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)",
      pdfUrl: "/assets/okobiz_profile-DvU1SuUS.pdf",
      badge: ""
    }
  }
};

function ensureStoreExists() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
  }
}

export function getDataStore(): DataStoreSchema {
  ensureStoreExists();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const store = JSON.parse(raw);
    if (!store.settings) {
      store.settings = { ...DEFAULT_STORE.settings };
    } else if (!store.settings.portfolioPdf) {
      store.settings.portfolioPdf = { ...DEFAULT_STORE.settings.portfolioPdf };
    }
    if (!store.services || !Array.isArray(store.services) || store.services.length < 6) {
      store.services = [...DEFAULT_STORE.services];
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
      } catch (e) {}
    }
    if (!store.products || !Array.isArray(store.products) || store.products.length === 0) {
      store.products = [...(DEFAULT_STORE.products || [])];
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
      } catch (e) {}
    }
    // Ensure services have pricingPlans and no priceRange
    if (store.services && Array.isArray(store.services)) {
      store.services.forEach((srv: any) => {
        delete srv.priceRange;
        if (!srv.slug) srv.slug = createSlug(srv.title);
        if (!srv.pricingPlans || !Array.isArray(srv.pricingPlans)) {
          srv.pricingPlans = [];
        }
      });
    }
    // Ensure themes have slugs
    if (store.themes && Array.isArray(store.themes)) {
      store.themes.forEach((thm: any) => {
        if (!thm.slug) thm.slug = createSlug(thm.websiteTitle || "project");
      });
    }
    // Ensure products have clean slugs
    if (store.products && Array.isArray(store.products)) {
      store.products.forEach((prod: any) => {
        if (!prod.slug || prod.slug.startsWith("prod-")) {
          prod.slug = createSlug(prod.title || "product");
        }
      });
    }
    return store;
  } catch (err) {
    return DEFAULT_STORE;
  }
}

export function saveDatastore(data: DataStoreSchema) {
  ensureStoreExists();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}
