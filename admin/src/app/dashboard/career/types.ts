export interface JobOpening {
  _id: string;
  title: string;
  slug: string;
  department: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  experience: string;
  salary: string;
  vacancies: number;
  deadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: "active" | "closed";
  order: number;
  applicantsCount?: number;
  createdAt: string;
}

export interface JobApplication {
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
  emailsSent?: Array<{
    subject: string;
    message: string;
    sentAt: string;
    sentBy?: string;
    status: string;
  }>;
  createdAt: string;
}

export interface EmailTemplateItem {
  _id: string;
  name: string;
  subject: string;
  body: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DEPARTMENTS = [
  "All",
  "Engineering",
  "UI/UX Design",
  "Digital Marketing",
  "SQA & Testing",
  "Project Management",
  "Sales & Business"
];

export const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  reviewing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  shortlisted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  interview: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  offered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  hired: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30"
};

