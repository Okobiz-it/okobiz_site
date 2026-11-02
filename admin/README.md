# okobiz Admin Panel

Enterprise Content & Multimedia Management System built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB / Mongoose** with resilient local synchronization.

## 🚀 Quick Start

```bash
cd d:\okobiz\admin
npm run dev     # Starts Admin Panel on http://localhost:3001
# OR
npm run build
npm run start   # Starts production build on http://localhost:3001
```

- **Client App**: Runs on `http://localhost:3000`
- **Admin Panel**: Runs on `http://localhost:3001`

---

## 🔐 Admin Authentication

Access the admin dashboard at: [http://localhost:3001/login](http://localhost:3001/login)

- **Default Email**: `admin@okobiz.com`
- **Default Password**: `admin123`
*(Features an Auto-fill button on the login screen for instant testing)*

---

## 🛠️ Management Modules & Capabilities

| Module | Route | Supported Actions |
|---|---|---|
| **Overview** | `/dashboard` | Key business metrics, customer leads overview, hero slide status |
| **Hero Carousel** | `/dashboard/hero` | Create, edit, toggle visibility, reorder slides, custom CTA links |
| **Client Partners** | `/dashboard/clients` | Add partner logos, website URLs, ordering, auto-slider sync |
| **Portfolio & Themes** | `/dashboard/portfolio` | Add web themes, pricing, discount prices, features checklist, live demo links |
| **Blog Articles** | `/dashboard/blogs` | Rich post creation, category filtering, cover photos, publish status |
| **Team & Advisors** | `/dashboard/team` | Core team members & Legal advisors, designations, avatar uploads |
| **Core Services** | `/dashboard/services` | Web & App, Creative Solutions, Digital Marketing, custom service packages |
| **Media Library** | `/dashboard/media` | **Images, PDF brochures/proposals, and Video reels** with instant file upload & URL copying |
| **FAQs** | `/dashboard/faqs` | Accordion questions & answers, categories, order |
| **Customer Leads** | `/dashboard/inquiries` | Contact submissions, status tracking (New, In Progress, Resolved), mailto replies |
| **Site Settings** | `/dashboard/settings` | Official phone number, email, address, WhatsApp hotline, homepage excellence counters |

---

## 📁 Multimedia Asset Syncing (Images, PDFs, Videos)

When media is uploaded through the Admin Panel:
1. Files are stored in `admin/public/uploads/`
2. Files are **automatically mirrored** into `client/public/uploads/`
3. Any image, PDF brochure, or video uploaded from the admin panel can be immediately referenced and rendered on the client website at `/uploads/<filename>`.

---

## 🗄️ Database Architecture

- **Primary**: Connects to MongoDB via Mongoose using `MONGODB_URI` in `.env.local` (defaults to `mongodb://127.0.0.1:27017/okobiz`).
- **Resilient Fallback**: If MongoDB is not yet running, a persistent local JSON store (`data/admin_store.json`) keeps the admin panel operating with zero interruption.
