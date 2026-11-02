import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "okobiz Admin | Content & Media Management",
  description: "Enterprise Admin Control Panel for okobiz - Manage contents, client partners, portfolio projects, blogs, team members, and media assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0C0E] text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
