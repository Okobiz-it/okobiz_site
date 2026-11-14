/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const rawAdminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || (process.env.VERCEL || process.env.NODE_ENV === "production" ? "https://okobizadmin.vercel.app" : "http://localhost:3001");
    const adminUrl = rawAdminUrl.replace(/\/+$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${adminUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
