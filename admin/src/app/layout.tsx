import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Okobiz Admin",
  description:
    "Enterprise Admin Control Panel for okobiz - Manage contents, client partners, portfolio projects, blogs, team members, and media assets.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem('okobiz-admin-theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            })();`,
          }}
        />
      </head>
      <body className="bg-[#0B0C0E] text-gray-100 min-h-screen antialiased transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
