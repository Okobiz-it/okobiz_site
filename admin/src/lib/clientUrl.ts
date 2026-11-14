/**
 * Dynamically resolves the base URL for the client-facing website.
 * Prioritizes:
 * 1. process.env.NEXT_PUBLIC_CLIENT_URL (stripped of any trailing slashes)
 * 2. If running in browser on Vercel or any non-localhost domain: defaults to https://okobizclient.vercel.app
 * 3. In server-side production: defaults to https://okobizclient.vercel.app
 * 4. In local development: defaults to http://localhost:3000
 */

const PRODUCTION_CLIENT_URL = "https://okobizclient.vercel.app";

export function getClientUrl(): string {
  // 1. Explicit environment variable
  const envUrl = process.env.NEXT_PUBLIC_CLIENT_URL?.trim().replace(/\/+$/, "");
  if (envUrl && envUrl !== "http://localhost:3000") {
    return envUrl;
  }

  // 2. Client-side browser execution:
  // If running on Vercel or any live domain other than localhost/127.0.0.1
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("vercel.app") || (!host.includes("localhost") && !host.includes("127.0.0.1"))) {
      return PRODUCTION_CLIENT_URL;
    }
    if (envUrl) return envUrl;
    return "http://localhost:3000";
  }

  // 3. Server-side execution on Vercel or in production
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return PRODUCTION_CLIENT_URL;
  }

  return envUrl || "http://localhost:3000";
}

/**
 * Builds a clean, fully-qualified URL to a client page.
 * @param path e.g. "/services/web-dev" or "services/web-dev"
 */
export function getClientLink(path = ""): string {
  const base = getClientUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

