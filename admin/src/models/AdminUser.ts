import mongoose, { Schema } from "mongoose";

export interface IAdminUser {
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, default: "Admin" },
  role: { type: String, default: "superadmin" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
