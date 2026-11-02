import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "okobiz - Premier Software & Digital Media Agency",
  description:
    "okobiz, a premier software firm, boasts a team of adept professionals specializing in dynamic digital media, graphic content, web design & development, logo creation, and branding. Our global clientele includes esteemed brands.",
  keywords: [
    "okobiz",
    "software company in bangladesh",
    "web development",
    "app development",
    "digital marketing",
    "graphic design",
    "branding services",
    "SEO services",
    "e-commerce solutions",
    "UI/UX design",
  ],
  authors: [{ name: "okobiz" }],
  creator: "okobiz",
  publisher: "okobiz",
  metadataBase: new URL("https://okobiz.com"),
  icons: {
    icon: "/okobiz-icon.png",
    apple: "/okobiz-icon.png",
  },
  openGraph: {
    title: "okobiz - Premier Software & Digital Media Agency",
    description:
      "Full-service software, web development, digital marketing, and creative agency delivering high-performance digital experiences.",
    url: "https://okobiz.com",
    siteName: "okobiz",
    images: [
      {
        url: "/assets/okobiz-logo-C_Tt48xb.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="bg-black text-white antialiased min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
