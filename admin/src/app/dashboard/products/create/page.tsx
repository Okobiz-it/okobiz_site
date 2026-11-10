import React from "react";
import { ProductForm } from "@/components/products/ProductForm";

export const metadata = {
  title: "Add New Product | Okobiz Admin",
};

export default function CreateProductPage() {
  return (
    <div className="w-full">
      <ProductForm isEdit={false} />
    </div>
  );
}

