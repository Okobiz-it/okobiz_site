import { NextResponse } from "next/server";
import { signToken, checkDefaultCredentials } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    // 1. Check default credentials first for immediate zero-config access
    if (checkDefaultCredentials(email, password)) {
      const token = signToken({ email: email.toLowerCase(), name: "Super Admin", role: "superadmin" });
      const res = NextResponse.json({ success: true, user: { email: email.toLowerCase(), name: "Super Admin", role: "superadmin" } });
      res.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/"
      });
      return res;
    }

    // 2. Check MongoDB if connected
    const db = await connectDB();
    if (db) {
      const user = await AdminUser.findOne({ email: email.toLowerCase() });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const token = signToken({ email: user.email, name: user.name, role: user.role });
          const res = NextResponse.json({ success: true, user: { email: user.email, name: user.name, role: user.role } });
          res.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
          });
          return res;
        }
      }
    }

    return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Login error" }, { status: 500 });
  }
}
