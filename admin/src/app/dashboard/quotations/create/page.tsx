import React from "react";
import { QuotationForm } from "@/components/quotation/quotation-form";

export const metadata = {
  title: "Create Quotation | Okobiz Admin",
};

export default function CreateQuotationPage() {
  return (
    <div className="w-full">
      <QuotationForm />
    </div>
  );
}

