"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Plus
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { createSlug } from "@/lib/slug";
import { toast } from "@/lib/toast";

export interface JobFormData {
  _id?: string;
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
  status: "active" | "closed";
  order: number;
}

const DEPARTMENTS = [
  "Engineering",
  "Design & Creative",
  "Product & Project",
  "Quality Assurance & DevOps",
  "Marketing & Growth",
  "Sales & Accounts",
  "HR & Administration",
  "Customer Support",
  "Custom"
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const WORKPLACE_TYPES = ["On-site", "Remote", "Hybrid"];

const DEFAULT_JOB_TEMPLATE = `<h2>Role Overview</h2>
<p>We are seeking a talented and passionate professional to join our engineering and technology team at okobiz. You will collaborate with cross-functional teams to build high-performance web systems and enterprise software for global businesses.</p>

<h2>Key Responsibilities</h2>
<ul>
  <li>Architect, develop, and deploy clean, maintainable software features.</li>
  <li>Collaborate with UI/UX designers, product leads, and QA specialists.</li>
  <li>Participate in peer code reviews, continuous integration, and performance benchmarking.</li>
</ul>

<h2>Required Qualifications &amp; Skills</h2>
<ul>
  <li>Proven track record in modern software engineering with hands-on framework experience.</li>
  <li>Deep understanding of web performance, database optimization, and API design.</li>
  <li>Clear communication skills and enthusiasm for innovative problem solving.</li>
</ul>

<h2>What We Offer (Perks &amp; Culture)</h2>
<ul>
  <li>Competitive industry salary with annual compensation reviews.</li>
  <li>2 Festival Bonuses per year (Eid-ul-Fitr &amp; Eid-ul-Adha).</li>
  <li>Subsidized nutritious daily lunch, unlimited artisanal coffee, and modern gaming lounge.</li>
  <li>Modern multi-display workstation in our Mirpur tech hub.</li>
</ul>`;

const DEFAULT_FORM: JobFormData = {
  title: "",
  slug: "",
  department: "Engineering",
  employmentType: "Full-time",
  workplaceType: "On-site",
  location: "Mirpur, Dhaka 1216",
  experience: "2-4 Years",
  salary: "৳80,000 - ৳120,000 / month",
  vacancies: 1,
  deadline: "",
  description: DEFAULT_JOB_TEMPLATE,
  status: "active",
  order: 1
};

interface JobFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function JobForm({ initialData, isEdit = false }: JobFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<JobFormData>(DEFAULT_FORM);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      const isKnownDept = DEPARTMENTS.includes(initialData.department);
      if (!isKnownDept && initialData.department) {
        setIsCustomDept(true);
        setCustomDeptInput(initialData.department);
      } else {
        setIsCustomDept(false);
        setCustomDeptInput("");
      }

      setForm({
        _id: initialData._id,
        title: initialData.title || "",
        slug: initialData.slug || createSlug(initialData.title || ""),
        department: isKnownDept ? initialData.department : "Custom",
        employmentType: initialData.employmentType || "Full-time",
        workplaceType: initialData.workplaceType || "On-site",
        location: initialData.location || "Mirpur, Dhaka 1216",
        experience: initialData.experience || "2-4 Years",
        salary: initialData.salary || "Negotiable",
        vacancies: initialData.vacancies || 1,
        deadline: initialData.deadline ? initialData.deadline.split("T")[0] : "",
        description: initialData.description || DEFAULT_JOB_TEMPLATE,
        status: initialData.status === "closed" ? "closed" : "active",
        order: initialData.order || 1
      });
    }
  }, [initialData]);

  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      const updates: Partial<JobFormData> = { title: val };
      if (!isEdit || !prev.slug || prev.slug === createSlug(prev.title)) {
        updates.slug = createSlug(val);
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a job title.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Please provide a job description.");
      return;
    }

    const resolvedDept = (isCustomDept ? customDeptInput.trim() : form.department.trim()) || "Engineering";
    if (!resolvedDept) {
      toast.error("Please specify a department.");
      return;
    }

    const finalSlug = createSlug(form.slug || form.title || "job");

    setSaving(true);
    const toastId = toast.loading(isEdit ? "Updating job opening..." : "Posting job opening...");

    const payload = {
      ...form,
      title: form.title.trim(),
      slug: finalSlug,
      department: resolvedDept,
      description: form.description.trim(),
      responsibilities: [],
      requirements: [],
      benefits: []
    };

    try {
      let res: Response;
      if (isEdit && form._id) {
        res = await fetch("/api/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: form._id, ...payload })
        });
      } else {
        res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const resData = await res.json();
      toast.dismiss(toastId);

      if (!res.ok || !resData.success) {
        toast.error(resData.message || "Failed to save job opening.");
        return;
      }

      toast.success(isEdit ? "Job opening updated!" : "Job opening published!");
      router.push("/dashboard/career");
      router.refresh();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to save job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Sticky Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#131417] p-4 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/career"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Career
          </Link>
          <div className="h-5 w-px bg-slate-200 dark:bg-gray-800 hidden sm:block" />
          <div className="min-w-0">
            <h1
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate max-w-[280px] sm:max-w-md lg:max-w-xl"
              title={isEdit ? `Edit Job Opening: ${form.title || "Untitled"}` : "Post New Job Opening"}
            >
              <Briefcase className="w-5 h-5 text-[#0167D6] shrink-0" />
              <span className="truncate">{isEdit ? `Edit Job Opening: ${form.title || "Untitled"}` : "Post New Job Opening"}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Link
            href="/dashboard/career"
            className="px-4 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </Link>

          {isEdit && form.slug && (
            <a
              href={`http://localhost:3000/career/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[4px] border border-blue-200 dark:border-blue-800 text-[#0167D6] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            >
              <ExternalLink size={13} /> View Live Posting
            </a>
          )}

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{isEdit ? "Update Job Opening" : "Publish Job Opening"}</span>
          </button>
        </div>
      </div>

      {/* Unified Master Card: Role Content & Logistics in the SAME BOX */}
      <div className="bg-white dark:bg-[#131417] rounded-[6px] border border-slate-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-gray-800">
          {/* Left Column (8 cols): Title, Dept & Full Description */}
          <div className="lg:col-span-8 p-6 lg:p-7 space-y-6">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                1
              </span>
              Role Information &amp; Description
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Full-Stack Engineer (Next.js & Node.js)"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  URL Slug (/career/slug)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="senior-full-stack-engineer"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, slug: createSlug(form.title) })}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-[4px] text-xs font-semibold hover:bg-slate-200 dark:hover:bg-gray-700 transition"
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Department *
                </label>
                <select
                  value={isCustomDept ? "Custom" : form.department}
                  onChange={(e) => {
                    if (e.target.value === "Custom") {
                      setIsCustomDept(true);
                    } else {
                      setIsCustomDept(false);
                      setForm({ ...form, department: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {isCustomDept && (
                  <input
                    type="text"
                    placeholder="Enter custom department name..."
                    value={customDeptInput}
                    onChange={(e) => setCustomDeptInput(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-white dark:bg-[#18191D] border border-blue-400 dark:border-blue-600 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Comprehensive Role Description &amp; Requirements *
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
                placeholder="Detail role overview, responsibilities, required qualifications, and perks..."
                minHeight="min-h-[460px]"
              />
            </div>
          </div>

          {/* Right Column (4 cols): Parameters, Compensation & Logistics */}
          <div className="lg:col-span-4 p-6 lg:p-7 bg-slate-50/50 dark:bg-[#15171B]/50 space-y-5">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Employment &amp; Logistics
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Posting Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "active" })}
                  className={`py-2 px-3 rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                    form.status === "active"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <CheckCircle2 size={14} /> Active
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "closed" })}
                  className={`py-2 px-3 rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                    form.status === "closed"
                      ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      : "border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <XCircle size={14} /> Closed
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Employment Type
                </label>
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Workplace Mode
                </label>
                <select
                  value={form.workplaceType}
                  onChange={(e) => setForm({ ...form, workplaceType: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  {WORKPLACE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-[#0167D6]" /> Office / Job Location
              </label>
              <input
                type="text"
                placeholder="e.g. Mirpur, Dhaka 1216"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Clock size={12} className="text-[#0167D6]" /> Experience Requirement
              </label>
              <input
                type="text"
                placeholder="e.g. 2-4 Years, Entry Level, 5+ Years"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <DollarSign size={12} className="text-emerald-500" /> Salary / Compensation
              </label>
              <input
                type="text"
                placeholder="e.g. ৳80,000 - ৳120,000 / month or Negotiable"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Users size={12} className="text-[#0167D6]" /> Open Vacancies
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.vacancies}
                  onChange={(e) => setForm({ ...form, vacancies: Number(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Calendar size={12} className="text-[#0167D6]" /> Application Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })}
                className="w-28 px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

