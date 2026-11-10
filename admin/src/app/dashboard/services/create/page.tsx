import React from "react";
import { ServiceForm } from "@/components/services/ServiceForm";

export const metadata = {
  title: "Add New Service | Okobiz Admin",
};

export default function CreateServicePage() {
  return (
    <div className="w-full">
      <ServiceForm isEdit={false} />
    </div>
  );
}

