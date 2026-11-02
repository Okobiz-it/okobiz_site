"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  CheckCircle,
  Clock,
  ShieldCheck,
  Headphones,
  Upload,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import { useEffect } from "react";
import PreviewModal from "@/components/PreviewModal";
import { ThemeItem } from "@/data/mockData";
import { sendOrder, getThemes } from "@/lib/api";
import { renderRichText } from "@/lib/richText";

export default function WebThemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const themeId = params.id as string;

  const [theme, setTheme] = useState<ThemeItem | null>(null);

  useEffect(() => {
    getThemes().then((data) => {
      if (data && data.length > 0) {
        const match = data.find((t) => t._id === themeId) || data[0];
        setTheme(match);
      }
    });
  }, [themeId]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    number: "",
    message: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("themeId", theme._id);
    data.append("themeTitle", theme.websiteTitle);
    data.append("fullName", formData.fullName);
    data.append("number", formData.number);
    data.append("message", formData.message);
    if (selectedFile) {
      data.append("file", selectedFile);
    }

    try {
      await sendOrder(data);
      router.push("/thankYouForOrder");
    } catch (err) {
      router.push("/thankYouForOrder");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!theme) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3368B2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black text-white">
      <PageBanner
        title={theme.websiteTitle}
        subtitle="Theme Specifications & Direct Deployment Order"
      />

      <section className="py-16 bg-[#141416]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Products</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Product Image & Overview */}
            <div className="lg:col-span-7 space-y-8">
              <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#181A1D] shadow-2xl relative">
                <img
                  src={theme.photo}
                  alt={theme.websiteTitle}
                  className="w-full h-auto object-cover"
                />
                <div className="p-4 bg-gray-900/90 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#0167D6] bg-[#0167D6]/10 px-3 py-1 rounded">
                    Category: {theme.category}
                  </span>

                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3368B2] hover:bg-[#0167D6] text-white rounded text-xs font-bold transition-colors shadow"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Preview</span>
                  </button>
                </div>
              </div>

              {/* Description & Features */}
              <div className="bg-[#181A1D] border border-gray-800 rounded-xl p-8 space-y-6">
                <h3 className="text-xl font-bold text-white">Description</h3>
                <div
                  className="text-sm text-gray-300 leading-relaxed rich-text-content"
                  dangerouslySetInnerHTML={{ __html: renderRichText(theme.description) }}
                />

                <h3 className="text-xl font-bold text-white pt-4 border-t border-gray-800">
                  Included Features
                </h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  {theme.features?.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0167D6] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#181A1D] border border-gray-800 p-4 rounded-lg flex flex-col items-center text-center">
                  <ShieldCheck className="w-6 h-6 text-[#3368B2] mb-2" />
                  <span className="text-xs font-bold text-white">Well Documented</span>
                </div>
                <div className="bg-[#181A1D] border border-gray-800 p-4 rounded-lg flex flex-col items-center text-center">
                  <Clock className="w-6 h-6 text-[#3368B2] mb-2" />
                  <span className="text-xs font-bold text-white">Recently Updated</span>
                </div>
                <div className="bg-[#181A1D] border border-gray-800 p-4 rounded-lg flex flex-col items-center text-center">
                  <Headphones className="w-6 h-6 text-[#3368B2] mb-2" />
                  <span className="text-xs font-bold text-white">24/7 Support</span>
                </div>
                <div className="bg-[#181A1D] border border-gray-800 p-4 rounded-lg flex flex-col items-center text-center">
                  <CheckCircle className="w-6 h-6 text-[#3368B2] mb-2" />
                  <span className="text-xs font-bold text-white">Free Maintenance</span>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Order Form */}
            <div className="lg:col-span-5">
              <div className="bg-[#181A1D] border border-gray-800 rounded-xl p-8 shadow-2xl sticky top-28">
                {/* Price Header */}
                <div className="border-b border-gray-800 pb-6 mb-6">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                    Direct License & Setup
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-white">
                      ৳{theme.discountPrice}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ৳{theme.price}
                    </span>
                  </div>
                  <p className="text-xs text-green-400 mt-2">
                    ✓ Includes full source code, deployment assistance & 1 year domain/hosting consultation.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h4 className="text-base font-bold text-white mb-2">
                    Confirm Order & Get Started
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-black/60 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 1..."
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-black/60 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Customization Requirements / Message
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us any specific features or changes you need..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-black/60 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Attach Requirements Doc or Logo (Optional)
                    </label>
                    <div className="relative border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-lg p-4 text-center cursor-pointer bg-black/30">
                      <input
                        type="file"
                        accept=".pdf,image/*,.doc,.docx"
                        onChange={(e) =>
                          setSelectedFile(e.target.files ? e.target.files[0] : null)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">
                        {selectedFile ? selectedFile.name : "Click to upload file"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 py-3 bg-[#004282] hover:bg-[#0167D6] text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Placing Order..." : "Confirm Order"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TalkCta />

      {/* Preview Modal */}
      {isPreviewOpen && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          url={theme.websiteLink}
          title={theme.websiteTitle}
        />
      )}
    </div>
  );
}
