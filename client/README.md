# Okobiz - Next.js 14 Frontend Application

A production-grade Next.js 14 frontend reconstruction of [https://okobiz.com/](https://okobiz.com/), converted from the previous Vite React production build into modern TypeScript and the Next.js App Router.

---

## 🚀 Key Highlights & Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS with custom branding tokens (`#0167D6`, `#3368B2`, `#004282`, `#141416`, `#181A1D`) and micro-animations
- **Icons**: Lucide React & custom SVG / image assets
- **Data & Resiliency**: Centralized API service (`src/lib/api.ts`) connecting to `https://backend.okobiz.com/` with comprehensive, 100% offline-ready mock data fallbacks (`src/data/mockData.ts`)
- **Assets**: All 199 media assets (SVGs, PNGs, WebMs, WebPs, PDFs) preserved in `public/assets/`

---

## 📁 Project Structure

```
d:\okobiz\well-known
├── public/
│   ├── assets/              # All 199 original brand logos, team photos, video clips, and PDF
│   └── okobiz-icon.png      # Brand favicon icon
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with SEO metadata, Outfit & Inter fonts, Nav & Footer
│   │   ├── page.tsx         # Homepage with Hero video, Stats, Solutions, Themes, Tech Stack, FAQ
│   │   ├── about/           # About Okobiz, story, growth, mission & vision
│   │   ├── services/        # Service directory with WhatsApp order links
│   │   ├── website-app-development-service/ # Web & App engineering landing page
│   │   ├── graphics-solution-service/       # Graphics design landing page
│   │   ├── digital-marketing-service/       # Digital marketing landing page
│   │   ├── portfolio/       # Company profile & interactive PDF viewer
│   │   ├── demo/            # Web themes shop with filters, search, and live preview modal
│   │   ├── webthemes/[id]/  # Single theme details & checkout/order form with file upload
│   │   ├── ourclients/      # Enterprise client and partner showcase
│   │   ├── amazing_team/    # Team leadership, designers, engineers, and legal advisors
│   │   ├── blog/            # Blog article catalog with category filters
│   │   ├── blogs/[id]/      # Single blog reader with multi-platform social share
│   │   ├── contact-us/      # Contact information & interactive inquiry form
│   │   ├── login/           # Client / admin login
│   │   ├── signup/          # User registration
│   │   ├── forgotpassword/  # Password reset request
│   │   ├── verify/          # Verification code screen
│   │   ├── restPassword/[token]/ # Password reset completion
│   │   ├── thankyou/        # Contact submission thank-you screen
│   │   ├── thankYouForOrder/# Order completion thank-you screen
│   │   ├── aklogicAdmin/    # Administration portal for themes, orders, blogs & inquiries
│   │   └── not-found.tsx    # Custom 404 page
│   ├── components/
│   │   ├── Navbar.tsx       # Responsive header with mobile drawer
│   │   ├── Footer.tsx       # Rich footer with links, office details, and copyright
│   │   ├── PageBanner.tsx   # Reusable hero banner for interior pages
│   │   ├── TalkCta.tsx      # "Let's Talk With Us" CTA banner
│   │   ├── WhatsAppFloat.tsx# Floating interactive WhatsApp widget
│   │   └── PreviewModal.tsx # Fullscreen iframe preview for live themes
│   ├── data/
│   │   └── mockData.ts      # Comprehensive offline datasets (team, clients, themes, blogs)
│   └── lib/
│       └── api.ts           # Unified API client with automatic graceful fallbacks
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🛠️ How to Run

### Development Server
```bash
# Standard dev server (default port 3000)
npm run dev

# Or run on port 3005 if port 3000 is occupied
npm run dev:3005
```

### Production Build & Run
```bash
# 1. Build the Next.js app
npm run build

# 2. Start the production server on port 3005 (or custom port)
npm run start:3005

# Or on default port:
npm run start
```
