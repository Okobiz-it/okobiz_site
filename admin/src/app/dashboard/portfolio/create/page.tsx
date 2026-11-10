import React from "react";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";

export const metadata = {
  title: "Add Portfolio Project | Okobiz Admin",
};

export default function CreatePortfolioPage() {
  return (
    <div className="w-full">
      <PortfolioForm isEdit={false} />
    </div>
  );
}

