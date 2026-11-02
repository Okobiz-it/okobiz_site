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
      <div className="p-4 bg-[#0E0F12] border border-gray-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-[#3368B2]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Front Media: Video Showcase
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">Media Type:</span>
            <select
              value={form.mediaType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  mediaType: e.target.value as "image" | "video",
                }))
              }
              className="bg-[#15171C] border border-gray-700 text-xs rounded px-2 py-1 text-white"
            >
              <option value="image">Show Images Only</option>
              <option value="video">Show Video First</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Showcase a walkthrough video in the front of your product page (supports YouTube video URL or uploaded MP4 video).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* YouTube Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">YouTube Video URL</label>
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
              className="w-full px-3 py-2 bg-[#15171C] border border-gray-800 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
            />
          </div>

          {/* Direct MP4 Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Or Upload Direct MP4 / WebM Video</span>
              {uploadingVideo && <Loader2 size={12} className="animate-spin text-blue-400" />}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Direct video file URL"
                value={form.video}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, video: e.target.value, mediaType: "video" }))
                }
                className="flex-1 px-3 py-2 bg-[#15171C] border border-gray-800 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
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
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded font-semibold shrink-0"
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Video Preview */}
        {(form.youtubeUrl || form.video) && (
          <div className="mt-3 p-3 bg-black/50 rounded-lg border border-gray-800">
            <p className="text-[11px] font-bold text-gray-400 mb-2">Video Preview:</p>
            {isYouTubeUrl(form.youtubeUrl || form.video) ? (
              <div className="relative aspect-video max-w-md mx-auto rounded overflow-hidden">
                <iframe
                  src={getYouTubeEmbedUrl(form.youtubeUrl || form.video) || ""}
                  title="YouTube Preview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : form.video ? (
              <div className="max-w-md mx-auto rounded overflow-hidden">
                <video src={form.video} controls className="w-full h-auto" />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Multiple Gallery Images Section */}
      <div className="p-4 bg-[#0E0F12] border border-gray-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-[#3368B2]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Multiple Screenshots & Mockups ({form.images.length})
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3368B2] hover:bg-[#0167D6] text-white text-xs font-bold transition shadow"
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
            className="flex-1 px-3 py-2 bg-[#15171C] border border-gray-800 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
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
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded font-semibold"
          >
            Add URL
          </button>
        </div>

        {/* Image Gallery Cards */}
        {form.images.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-800 rounded-lg">
            <ImageIcon size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-xs text-gray-400">No images added yet.</p>
            <p className="text-[11px] text-gray-500 mt-1">
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
                  className={`relative group rounded-lg overflow-hidden border bg-black flex flex-col ${
                    isCover ? "border-[#3368B2] ring-2 ring-blue-500/30" : "border-gray-800"
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 bg-[#3368B2] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Primary Cover
                      </span>
                    )}
                  </div>

                  <div className="p-1.5 bg-[#15171C] flex items-center justify-between border-t border-gray-800/60">
                    {!isCover ? (
                      <button
                        type="button"
                        onClick={() => setImageAsCover(img)}
                        className="text-[10px] text-gray-400 hover:text-white transition"
                      >
                        Set Cover
                      </button>
                    ) : (
                      <span className="text-[10px] text-blue-400 font-bold">Cover</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="text-gray-400 hover:text-red-400 p-0.5 rounded transition"
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
