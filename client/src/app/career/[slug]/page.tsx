"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  Sparkles,
  Send,
  Check,
  Loader2,
  Briefcase,
  Share2,
  Building,
  ShieldCheck,
  Laptop,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  CheckCheck
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import UniversalLoader from "@/components/UniversalLoader";
import DataLoadError from "@/components/DataLoadError";
import { getJobBySlug, applyForJob, JobItem } from "@/lib/api";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [job, setJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Form State
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantResumeUrl, setApplicantResumeUrl] = useState("");
  const [applicantPortfolio, setApplicantPortfolio] = useState("");
  const [applicantGithub, setApplicantGithub] = useState("");
  const [applicantLinkedin, setApplicantLinkedin] = useState("");
  const [applicantExperience, setApplicantExperience] = useState("");
  const [applicantCurrentCompany, setApplicantCurrentCompany] = useState("");
  const [applicantExpectedSalary, setApplicantExpectedSalary] = useState("");
  const [applicantNoticePeriod, setApplicantNoticePeriod] = useState("");
  const [applicantCoverNote, setApplicantCoverNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(false);
      if (slug) {
        const item = await getJobBySlug(slug);
        if (item) {
          setJob(item);
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.warn("Failed to fetch job details:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim() || !applicantResumeUrl.trim()) {
      setSubmitError("Please fill out all mandatory fields marked with an asterisk (*).");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await applyForJob({
        jobId: job._id,
        jobTitle: job.title,
        name: applicantName.trim(),
        email: applicantEmail.trim(),
        phone: applicantPhone.trim(),
        resumeUrl: applicantResumeUrl.trim(),
        portfolioUrl: applicantPortfolio.trim(),
        githubUrl: applicantGithub.trim(),
        linkedinUrl: applicantLinkedin.trim(),
        experienceYears: applicantExperience.trim(),
        currentCompany: applicantCurrentCompany.trim(),
        expectedSalary: applicantExpectedSalary.trim(),
        noticePeriod: applicantNoticePeriod.trim(),
        coverNote: applicantCoverNote.trim()
      });

      if (res.success) {
        setSubmitSuccess(true);
        // Clear inputs
        setApplicantName("");
        setApplicantEmail("");
        setApplicantPhone("");
        setApplicantResumeUrl("");
        setApplicantPortfolio("");
        setApplicantGithub("");
        setApplicantLinkedin("");
        setApplicantExperience("");
        setApplicantCurrentCompany("");
        setApplicantExpectedSalary("");
        setApplicantNoticePeriod("");
        setApplicantCoverNote("");
      } else {
        setSubmitError(res.message || "Failed to submit application. Please try again.");
      }
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <UniversalLoader fullScreen size="lg" />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          <DataLoadError
            title="Position Couldn't Load"
            message="We were unable to locate this specific job opening or fetch live details from the database. Please check your connection or explore our active career openings."
            onRetry={fetchJob}
          />
          <div className="mt-4">
            <Link
              href="/career"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0167D6] hover:bg-blue-600 !text-white text-xs font-bold uppercase rounded-[4px] shadow-md transition"
            >
              <ArrowLeft size={14} /> View All Openings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#000000] text-slate-800 dark:text-gray-200 selection:bg-[#3368B2] selection:text-white">
      {/* Banner */}
      <PageBanner
        title={job.title}
        subtitle={`${job.department} • ${job.workplaceType} (${job.location}) • ${job.employmentType}`}
      />

      {/* Main Content Area */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 py-12 sm:py-16">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/career"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 hover:text-[#0167D6] dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#0167D6]" />
            <span>Back to All Openings</span>
          </Link>
        </div>

        {/* 2-Column Responsive Layout: Left Description | Right Apply Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              LEFT COLUMN: JOB SPECIFICATIONS & DETAILS (7 COLS)
          ========================================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-8">
            {/* Top Job Overview Card */}
            <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-[4px] text-xs font-bold bg-blue-50 dark:bg-[#3368B2]/20 text-[#0167D6] dark:text-[#3368B2] border border-blue-200 dark:border-[#3368B2]/40">
                  {job.department}
                </span>
                <span className="px-3 py-1 rounded-[4px] text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40">
                  {job.workplaceType}
                </span>
                <span className="px-3 py-1 rounded-[4px] text-xs font-semibold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300">
                  {job.employmentType}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {job.title}
              </h1>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-gray-800 text-xs text-slate-700 dark:text-gray-300">
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-gray-500 block uppercase text-[10px] font-bold">Office Location</span>
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#0167D6] shrink-0" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-gray-500 block uppercase text-[10px] font-bold">Experience Required</span>
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 shrink-0" />
                    <span>{job.experience}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-gray-500 block uppercase text-[10px] font-bold">Monthly Compensation</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                {job.vacancies && (
                  <div className="space-y-1">
                    <span className="text-slate-500 dark:text-gray-500 block uppercase text-[10px] font-bold">Vacancies</span>
                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>{job.vacancies} Position{job.vacancies === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                )}

                {job.deadline && (
                  <div className="space-y-1">
                    <span className="text-slate-500 dark:text-gray-500 block uppercase text-[10px] font-bold">Application Deadline</span>
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{job.deadline}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description & Specifications Card (Unified Rich Text) */}
            <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 sm:p-8 space-y-6 shadow-sm">
              {job.description && (
                <div
                  dangerouslySetInnerHTML={{ __html: job.description }}
                  className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-gray-300 leading-relaxed space-y-4 [&>h2]:text-base [&>h2]:sm:text-lg [&>h2]:font-bold [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h2]:uppercase [&>h2]:tracking-wider [&>h2]:pt-4 [&>h2:first-child]:pt-0 [&>h2]:border-t [&>h2:first-child]:border-t-0 [&>h2]:border-slate-200 dark:[&>h2]:border-gray-800/80 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-slate-900 dark:[&>h3]:text-white [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>p]:leading-relaxed"
                />
              )}

              {/* Backward compatibility: if legacy job has separate arrays and description didn't include them */}
              {job.responsibilities && job.responsibilities.length > 0 && !job.description.includes("Key Responsibilities") && (
                <div className="pt-4 border-t border-slate-200 dark:border-gray-800 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0167D6]" />
                    <span>Key Responsibilities</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {job.responsibilities.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-gray-300">
                        <span className="w-5 h-5 rounded-[4px] bg-blue-50 dark:bg-[#3368B2]/20 text-[#0167D6] dark:text-[#3368B2] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements && job.requirements.length > 0 && !job.description.includes("Required Qualifications") && (
                <div className="pt-4 border-t border-slate-200 dark:border-gray-800 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Required Qualifications &amp; Skills</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && !job.description.includes("What We Offer") && (
                <div className="pt-4 border-t border-slate-200 dark:border-gray-800 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>What We Offer (Perks &amp; Culture)</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {job.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-gray-300">
                        <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-1" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Share This Role Box */}
            <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Know someone who would be great for this role?</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">Share this opening with colleagues and friends.</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-white text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-transparent transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-[#0167D6]" />}
                <span>{copiedLink ? "Link Copied!" : "Copy Job Link"}</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: STICKY APPLICATION FORM (5 COLS)
          ========================================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-[#3368B2] to-emerald-400" />

              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0167D6] dark:text-[#3368B2] block mb-1">
                  Ready to Build?
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Apply For This Position
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                  Fill out the form below. Our engineering leadership reviews every submission within 48 business hours.
                </p>
              </div>

              {submitSuccess ? (
                <div className="py-10 px-4 text-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/40 rounded-[4px] space-y-4">
                  <div className="w-16 h-16 rounded-[4px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">Application Received!</h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    Thank you for your application for <strong className="text-slate-900 dark:text-white">{job.title}</strong> at okobiz! We have received your credentials and our talent acquisition team will review your profile and reach out shortly.
                  </p>
                  <button
                    onClick={() => router.push("/career")}
                    className="mt-3 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-[4px] transition-colors cursor-pointer shadow-md"
                  >
                    View Other Openings
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  {submitError && (
                    <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-300 rounded-[4px]">
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. tanvir@gmail.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +880 1700-000000"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                        Total Experience <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 3.5 Years"
                        value={applicantExperience}
                        onChange={(e) => setApplicantExperience(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Resume / CV Link (Google Drive, Dropbox) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/file/d/..."
                      value={applicantResumeUrl}
                      onChange={(e) => setApplicantResumeUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">
                      Ensure link sharing permission is set to "Anyone with the link can view".
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                        Expected Monthly Salary (BDT)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ৳100,000"
                        value={applicantExpectedSalary}
                        onChange={(e) => setApplicantExpectedSalary(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                        Notice Period
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Month / Immediate"
                        value={applicantNoticePeriod}
                        onChange={(e) => setApplicantNoticePeriod(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                        Current Company
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Brain Station 23 / Freelance"
                        value={applicantCurrentCompany}
                        onChange={(e) => setApplicantCurrentCompany(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={applicantLinkedin}
                        onChange={(e) => setApplicantLinkedin(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      GitHub / Portfolio URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/... or portfolio link"
                      value={applicantGithub}
                      onChange={(e) => setApplicantGithub(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Briefly tell us why you are interested in this position, your relevant background, or paste your cover letter..."
                      value={applicantCoverNote}
                      onChange={(e) => setApplicantCoverNote(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#0167D6] hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider rounded-[4px] shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Direct Support Callout */}
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-gray-800 text-center">
                <p className="text-[11px] text-slate-500 dark:text-gray-500">
                  Questions about this role? Reach our recruitment leads directly at{" "}
                  <a href="mailto:career@okobiz.com" className="text-[#0167D6] dark:text-[#3368B2] hover:underline font-semibold">
                    career@okobiz.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature CTA */}
      <TalkCta />
    </div>
  );
}

