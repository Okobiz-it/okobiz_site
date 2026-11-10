import React from "react";
import { BlogForm } from "@/components/blogs/BlogForm";

export const metadata = {
  title: "Write New Article | Okobiz Admin",
};

export default function CreateBlogPage() {
  return (
    <div className="w-full">
      <BlogForm isEdit={false} />
    </div>
  );
}

