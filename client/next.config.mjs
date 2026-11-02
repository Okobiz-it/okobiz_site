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
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${adminUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
