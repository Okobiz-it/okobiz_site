import mongoose, { Schema } from "mongoose";

export interface IJobOpening {
  _id: string;
  title: string;
  slug: string;
  department: string; // "Engineering" | "UI/UX Design" | "Digital Marketing" | "SQA & Testing" | "Project Management" | "Sales & Business"
  employmentType: string; // "Full-time" | "Part-time" | "Contract" | "Internship"
  workplaceType: string; // "On-site" | "Hybrid" | "Remote"
  location: string; // "Mirpur, Dhaka 1216"
  experience: string; // "3+ Years" | "2-4 Years" | "Fresh Graduate"
  salary: string; // "৳80,000 - ৳130,000 / month" or "Negotiable"
  vacancies: number;
  deadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: "active" | "closed";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobOpeningSchema = new Schema<IJobOpening>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    department: { type: String, required: true, default: "Engineering" },
    employmentType: { type: String, required: true, default: "Full-time" },
    workplaceType: { type: String, required: true, default: "On-site" },
    location: { type: String, required: true, default: "Mirpur, Dhaka 1216" },
    experience: { type: String, required: true, default: "2-4 Years" },
    salary: { type: String, default: "Negotiable" },
    vacancies: { type: Number, default: 1 },
    deadline: { type: String, default: "" },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    status: { type: String, enum: ["active", "closed"], default: "active" },
    order: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.JobOpening || mongoose.model<IJobOpening>("JobOpening", JobOpeningSchema);

