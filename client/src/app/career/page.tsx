"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import TalkCta from "@/components/TalkCta";
import { getJobs, JobItem } from "@/lib/api";
import CareerHero from "./components/CareerHero";
import EngineeringCulture from "./components/EngineeringCulture";
import WorkplaceBenefits from "./components/WorkplaceBenefits";
import CoreValues from "./components/CoreValues";
import HiringProcess from "./components/HiringProcess";
import JobOpeningsSection from "./components/JobOpeningsSection";
import CareerFaq from "./components/CareerFaq";

export default function CareerPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const openingsRef = useRef<HTMLElement>(null);
  const lifeRef = useRef<HTMLElement>(null);

  const fetchJobsList = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getJobs();
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.warn("Failed to fetch jobs:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsList();
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    return ["All", ...Array.from(set)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesDept =
        selectedDepartment === "All" ||
        job.department.toLowerCase() === selectedDepartment.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);
      const isActive = job.status !== "closed";
      return matchesDept && matchesQuery && isActive;
    });
  }, [jobs, selectedDepartment, searchQuery]);

  const scrollToOpenings = () => {
    openingsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToLife = () => {
    lifeRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#000000] text-slate-800 dark:text-gray-200 selection:bg-[#3368B2] selection:text-white">
      {/* 1. Hero */}
      <CareerHero
        jobCount={jobs.length}
        onScrollToOpenings={scrollToOpenings}
        onScrollToLife={scrollToLife}
      />

      {/* 2. Engineering Culture Showcase */}
      <EngineeringCulture />

      {/* 3. Workplace Benefits & Perks */}
      <WorkplaceBenefits ref={lifeRef} />

      {/* 4. Core Values & Principles */}
      <CoreValues />

      {/* 5. 5-Step Hiring Roadmap */}
      <HiringProcess />

      {/* 6. Dynamic Job Openings & Filtering Section */}
      <JobOpeningsSection
        ref={openingsRef}
        jobs={jobs}
        filteredJobs={filteredJobs}
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        error={error}
        onRetry={fetchJobsList}
      />

      {/* 7. FAQs (On-site Workspace) */}
      <CareerFaq />

      {/* 8. Signature CTA */}
      <TalkCta />
    </div>
  );
}
