import mongoose, { Schema } from "mongoose";

export interface ISentEmail {
  subject: string;
  message: string;
  sentAt: string;
  sentBy?: string;
  status: "sent" | "simulated" | "failed";
}

export interface IJobApplication {
  _id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl: string;
  coverNote?: string;
  experienceYears?: string;
  currentCompany?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  status: "new" | "reviewing" | "shortlisted" | "interview" | "offered" | "rejected" | "hired";
  notes?: string;
  emailsSent: ISentEmail[];
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    jobId: { type: String, required: true },
    jobTitle: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    portfolioUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    resumeUrl: { type: String, required: true },
    coverNote: { type: String, default: "" },
    experienceYears: { type: String, default: "" },
    currentCompany: { type: String, default: "" },
    expectedSalary: { type: String, default: "" },
    noticePeriod: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "reviewing", "shortlisted", "interview", "offered", "rejected", "hired"],
      default: "new"
    },
    notes: { type: String, default: "" },
    emailsSent: [
      {
        subject: { type: String, required: true },
        message: { type: String, required: true },
        sentAt: { type: String, default: () => new Date().toISOString() },
        sentBy: { type: String, default: "okobiz Recruitment" },
        status: { type: String, default: "sent" }
      }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);

