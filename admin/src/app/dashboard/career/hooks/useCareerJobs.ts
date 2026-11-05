"use client";

import { useState, useMemo, useEffect } from "react";
import { createSlug } from "@/lib/slug";
import { JobOpening, DEPARTMENTS } from "../types";
import { JobFormData } from "../components/JobFormModal";

const DEFAULT_JOB_TEMPLATE = `<h2>Role Overview</h2>
<p>We are seeking a talented and passionate professional to join our fast-growing engineering team at okobiz. You will collaborate with cross-functional product teams to deliver transformative digital experiences for global clients.</p>

<h2>Key Responsibilities</h2>
<ul>
  <li>Architect, design, and deliver performant software solutions.</li>
  <li>Collaborate closely with designers, product managers, and fellow engineers.</li>
  <li>Ensure high code craftsmanship, documentation, and automated testing.</li>
</ul>

<h2>Required Qualifications &amp; Skills</h2>
<ul>
  <li>2+ years of production experience in modern software engineering.</li>
  <li>Strong proficiency in JavaScript/TypeScript, React/Next.js, Node.js, and databases.</li>
  <li>Passionate about clean architecture, problem-solving, and continuous learning.</li>
</ul>

<h2>What We Offer (Perks &amp; Culture)</h2>
<ul>
  <li>Competitive compensation package with transparent performance reviews.</li>
  <li>2 Festival Bonuses per year (Eid-ul-Fitr &amp; Eid-ul-Adha).</li>
  <li>Subsidized nutritious daily lunch, unlimited artisan coffee, and team gaming lounge.</li>
  <li>Modern high-spec engineering workstations at our Mirpur hub.</li>
</ul>`;

export function useCareerJobs(
  jobs: JobOpening[],
  setJobs: React.Dispatch<React.SetStateAction<JobOpening[]>>,
  searchQuery: string
) {
  const [selectedDept, setSelectedDept] = useState("All");
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [jobSaving, setJobSaving] = useState(false);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState("");

  const [jobForm, setJobForm] = useState<JobFormData>({
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
    description: "",
    status: "active",
    order: 1
  });

  const allAvailableDepartments: string[] = useMemo(() => {
    const customDepts = jobs
      .map(j => j.department)
      .filter((d): d is string => Boolean(d && !DEPARTMENTS.includes(d)));
    return Array.from(new Set<string>([...DEPARTMENTS, ...customDepts]));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesDept = selectedDept === "All" || job.department === selectedDept;
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [jobs, selectedDept, searchQuery]);

  // Jobs Pagination (10 per page)
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const JOBS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentJobPage(1);
  }, [selectedDept, searchQuery]);

  const totalJobPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const jobStartIndex = (currentJobPage - 1) * JOBS_PER_PAGE;
  const jobEndIndex = Math.min(filteredJobs.length, jobStartIndex + JOBS_PER_PAGE);

  const paginatedJobs = useMemo(() => {
    return filteredJobs.slice(jobStartIndex, jobEndIndex);
  }, [filteredJobs, jobStartIndex, jobEndIndex]);

  const handleOpenCreateJob = () => {
    setEditingJob(null);
    setIsCustomDept(false);
    setCustomDeptInput("");
    setJobForm({
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
      order: jobs.length + 1
    });
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobOpening) => {
    setEditingJob(job);
    const standardDepts = DEPARTMENTS.filter(d => d !== "All");
    if (job.department && !standardDepts.includes(job.department)) {
      setIsCustomDept(true);
      setCustomDeptInput(job.department);
    } else {
      setIsCustomDept(false);
      setCustomDeptInput("");
    }
    let fullDesc = job.description || "";
    const hasHtmlBlocks = /<h[1-6]|<ul|<ol|<p>/i.test(fullDesc);
    if (!hasHtmlBlocks && (job.responsibilities?.length || job.requirements?.length || job.benefits?.length)) {
      let combined = fullDesc ? `<p>${fullDesc}</p>` : "";
      if (job.responsibilities?.length) {
        combined += `<h2>Key Responsibilities</h2><ul>${job.responsibilities.map(r => `<li>${r}</li>`).join("")}</ul>`;
      }
      if (job.requirements?.length) {
        combined += `<h2>Required Qualifications &amp; Skills</h2><ul>${job.requirements.map(r => `<li>${r}</li>`).join("")}</ul>`;
      }
      if (job.benefits?.length) {
        combined += `<h2>What We Offer (Perks &amp; Culture)</h2><ul>${job.benefits.map(b => `<li>${b}</li>`).join("")}</ul>`;
      }
      fullDesc = combined;
    }

    setJobForm({
      title: job.title,
      slug: job.slug,
      department: job.department,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      location: job.location,
      experience: job.experience,
      salary: job.salary,
      vacancies: job.vacancies || 1,
      deadline: job.deadline || "",
      description: fullDesc,
      status: job.status,
      order: job.order || 1
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      alert("Job Title and Description are required.");
      return;
    }

    const resolvedDept = (isCustomDept ? customDeptInput.trim() : jobForm.department.trim()) || "Engineering";
    if (!resolvedDept) {
      alert("Department is required. Please specify a department name.");
      return;
    }

    setJobSaving(true);
    const resolvedSlug = createSlug(jobForm.slug || jobForm.title);
    const payload = {
      ...jobForm,
      department: resolvedDept,
      slug: resolvedSlug,
      description: jobForm.description.trim(),
      responsibilities: [],
      requirements: [],
      benefits: []
    };

    try {
      if (editingJob) {
        const res = await fetch("/api/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editingJob._id, ...payload })
        });
        const data = await res.json();
        if (data.success) {
          setJobs(prev => prev.map(j => (j._id === editingJob._id ? { ...j, ...data.data } : j)));
          setIsJobModalOpen(false);
        } else {
          alert(data.message || "Failed to update job.");
        }
      } else {
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setJobs(prev => [data.data, ...prev]);
          setIsJobModalOpen(false);
        } else {
          alert(data.message || "Failed to create job.");
        }
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setJobSaving(false);
    }
  };

  const handleToggleJobStatus = async (job: JobOpening) => {
    const nextStatus = job.status === "active" ? "closed" : "active";
    try {
      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: job._id, status: nextStatus })
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => (j._id === job._id ? { ...j, status: nextStatus } : j)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/jobs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    selectedDept,
    setSelectedDept,
    allAvailableDepartments,
    filteredJobs,
    paginatedJobs,
    currentJobPage,
    setCurrentJobPage,
    totalJobPages,
    jobStartIndex,
    jobEndIndex,
    totalFilteredJobsCount: filteredJobs.length,
    isJobModalOpen,
    setIsJobModalOpen,
    editingJob,
    jobForm,
    setJobForm,
    isCustomDept,
    setIsCustomDept,
    customDeptInput,
    setCustomDeptInput,
    jobSaving,
    handleOpenCreateJob,
    handleOpenEditJob,
    handleSaveJob,
    handleToggleJobStatus,
    handleDeleteJob
  };
}

