import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Okobiz Admin",
  description: "Enterprise Admin Control Panel for okobiz - Manage contents, client partners, portfolio projects, blogs, team members, and media assets.",
  icons: {
    icon: "/okobiz-icon.png",
    shortcut: "/okobiz-icon.png",
    apple: "/okobiz-icon.png",
  },
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
