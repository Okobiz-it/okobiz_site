import React from "react";
import { JobForm } from "@/components/career/JobForm";

export const metadata = {
  title: "Post New Job Opening | Okobiz Admin",
};

export default function CreateJobPage() {
  return (
    <div className="w-full">
      <JobForm isEdit={false} />
    </div>
  );
}

