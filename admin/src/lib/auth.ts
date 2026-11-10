import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "okobiz_admin_super_secret_jwt_key_2026_secure";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@okobiz.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export interface AdminPayload {
  email: string;
  role: string;
  name: string;
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch (err) {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function checkDefaultCredentials(email: string, pass: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASSWORD;
}

export { bcrypt };
