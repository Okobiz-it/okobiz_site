"use client";

import React, { useRef } from "react";
import { Video, ImageIcon, Loader2, UploadCloud, Trash2 } from "lucide-react";
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/youtube";
import { ProductFormState } from "./types";

interface ProductMediaTabProps {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  uploadingVideo: boolean;
  uploadingMultiImages: boolean;
  handleVideoUpload: (file: File) => void;
  handleMultipleImagesUpload: (files: FileList | null) => void;
  setImageAsCover: (imgUrl: string) => void;
  removeGalleryImage: (idx: number) => void;
}

export default function ProductMediaTab({
  form,
  setForm,
  uploadingVideo,
  uploadingMultiImages,
  handleVideoUpload,
  handleMultipleImagesUpload,
  setImageAsCover,
  removeGalleryImage,
}: ProductMediaTabProps) {
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const multiImagesInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-6">
      {/* Primary Front Video Section */}
      <div className="p-4 bg-slate-50 dark:bg-[#0E0F12] border border-slate-200 dark:border-gray-800 rounded-[4px] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-[#0167D6]" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Front Media: Video Showcase
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 dark:text-gray-400">Media Type:</span>
            <select
              value={form.mediaType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  mediaType: e.target.value as "image" | "video",
                }))
              }
              className="bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-700 text-xs rounded px-2 py-1 text-slate-800 dark:text-white"
            >
              <option value="image">Show Images Only</option>
              <option value="video">Show Video First</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-gray-400">
          Showcase a walkthrough video in the front of your product page (supports YouTube video URL or uploaded MP4 video).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* YouTube Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300">YouTube Video URL</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtubeUrl}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  youtubeUrl: val,
                  mediaType: val ? "video" : prev.mediaType,
                }));
              }}
              className="w-full px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
            />
          </div>

          {/* Direct MP4 Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center justify-between">
              <span>Or Upload Direct MP4 / WebM Video</span>
              {uploadingVideo && <Loader2 size={12} className="animate-spin text-[#0167D6]" />}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Direct video file URL"
                value={form.video}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, video: e.target.value, mediaType: "video" }))
                }
                className="flex-1 px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
              />
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="px-3.5 py-2 bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs rounded-[4px] font-bold shrink-0 shadow-sm transition"
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>

        {/* Video Preview */}
        {(form.youtubeUrl || form.video) && (
          <div className="mt-3 p-3 bg-white dark:bg-[#15171C] rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs">
            <p className="text-[11px] font-bold text-slate-800 dark:text-gray-300 mb-2">Video Preview:</p>
            {isYouTubeUrl(form.youtubeUrl || form.video) ? (
              <div className="relative aspect-video max-w-md mx-auto rounded-[4px] overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-gray-800">
                <iframe
                  src={getYouTubeEmbedUrl(form.youtubeUrl || form.video) || ""}
                  title="YouTube Preview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : form.video ? (
              <div className="max-w-md mx-auto rounded-[4px] overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-gray-800">
                <video src={form.video} controls className="w-full h-auto" />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Multiple Gallery Images Section */}
      <div className="p-4 bg-slate-50 dark:bg-[#0E0F12] border border-slate-200 dark:border-gray-800 rounded-[4px] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-[#0167D6]" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Multiple Screenshots & Mockups ({form.images.length})
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
              Upload multiple high-definition screenshots (Dashboard, POS, Reports, Mobile App).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              ref={multiImagesInputRef}
              onChange={(e) => handleMultipleImagesUpload(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => multiImagesInputRef.current?.click()}
              disabled={uploadingMultiImages}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold transition shadow"
            >
              {uploadingMultiImages ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UploadCloud size={14} />
              )}
              <span>Upload Multiple Images</span>
            </button>
          </div>
        </div>

        {/* Direct Image URL input */}
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="Paste image URL here and click Add..."
            id="new-img-url"
            className="flex-1 px-3 py-2 bg-white dark:bg-[#15171C] border border-slate-300 dark:border-gray-800 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = (e.currentTarget.value || "").trim();
                if (val) {
                  setForm((prev) => ({
                    ...prev,
                    thumbnail: prev.thumbnail || val,
                    images: [...prev.images, val],
                  }));
                  e.currentTarget.value = "";
                }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("new-img-url") as HTMLInputElement;
              if (el && el.value.trim()) {
                const val = el.value.trim();
                setForm((prev) => ({
                  ...prev,
                  thumbnail: prev.thumbnail || val,
                  images: [...prev.images, val],
                }));
                el.value = "";
              }
            }}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-white text-xs rounded font-semibold"
          >
            Add URL
          </button>
        </div>

        {/* Image Gallery Cards */}
        {form.images.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-[4px]">
            <ImageIcon size={32} className="mx-auto text-slate-400 dark:text-gray-600 mb-2" />
            <p className="text-xs text-slate-600 dark:text-gray-400">No images added yet.</p>
            <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">
              Click "Upload Multiple Images" above or paste an image URL.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {form.images.map((img, idx) => {
              const isCover = form.thumbnail === img;
              return (
                <div
                  key={idx}
                  className={`relative group rounded-[4px] overflow-hidden border bg-white dark:bg-[#15171C] flex flex-col shadow-xs ${
                    isCover ? "border-[#0167D6] ring-2 ring-blue-500/30" : "border-slate-200 dark:border-gray-800"
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-50 dark:bg-black">
                    <img
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 bg-[#0167D6] text-white text-white-always text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Primary Cover
                      </span>
                    )}
                  </div>

                  <div className="p-1.5 bg-slate-100 dark:bg-[#15171C] flex items-center justify-between border-t border-slate-200 dark:border-gray-800/60">
                    {!isCover ? (
                      <button
                        type="button"
                        onClick={() => setImageAsCover(img)}
                        className="text-[10px] text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition font-medium"
                      >
                        Set Cover
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#0167D6] dark:text-blue-400 font-bold">Cover</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="text-slate-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-0.5 rounded transition"
                      title="Remove image"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
