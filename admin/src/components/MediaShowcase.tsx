"use client";

import React, { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Video,
  UploadCloud,
  Trash2,
  Loader2,
  Film,
  CheckCircle2,
  Play,
  Eye,
  Images,
  Sparkles,
  X,
} from "lucide-react";

export interface MediaShowcaseProps {
  mediaType: "image" | "video";
  onMediaTypeChange: (type: "image" | "video") => void;
  // Multiple images & front thumbnail
  images: string[];
  featuredImage?: string; // Primary image / thumbnail / photo
  onImagesChange: (images: string[], featuredImage: string) => void;
  // Video settings
  video?: string; // Direct MP4 video URL
  youtubeUrl?: string; // YouTube URL
  videoThumbnail?: string; // Custom video cover
  onVideoChange: (updates: { video?: string; youtubeUrl?: string; videoThumbnail?: string }) => void;
  title?: string;
}

function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/.test(url);
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function MediaShowcase({
  mediaType,
  onMediaTypeChange,
  images = [],
  featuredImage = "",
  onImagesChange,
  video = "",
  youtubeUrl = "",
  videoThumbnail = "",
  onVideoChange,
  title = "Media Showcase",
}: MediaShowcaseProps) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const multiImagesInputRef = useRef<HTMLInputElement>(null);
  const mp4InputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const effectiveFeatured = featuredImage || (images.length > 0 ? images[0] : "");
  const hasYoutube = Boolean(youtubeUrl && youtubeUrl.trim());
  const hasMp4 = Boolean(video && video.trim());
  const hasVideo = hasYoutube || hasMp4;
  const totalAssets = images.length + (hasVideo ? 1 : 0);

  // Upload single file helper
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
      alert(data.error || "Upload failed");
      return null;
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload file. Please check connection.");
      return null;
    }
  };

  // Multiple Images Upload
  const handleMultipleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setUploadProgress(`Uploading 1 of ${files.length}...`);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const url = await uploadFile(files[i]);
        if (url) newUrls.push(url);
      }

      if (newUrls.length > 0) {
        const merged = [...images, ...newUrls];
        const newFeatured = effectiveFeatured || merged[0];
        onImagesChange(merged, newFeatured);
      }
    } finally {
      setUploadingImages(false);
      setUploadProgress("");
      if (multiImagesInputRef.current) multiImagesInputRef.current.value = "";
    }
  };

  // Remove single image
  const handleRemoveImage = (indexToRemove: number) => {
    const targetUrl = images[indexToRemove];
    const filtered = images.filter((_, idx) => idx !== indexToRemove);
    let nextFeatured = effectiveFeatured;

    if (effectiveFeatured === targetUrl) {
      nextFeatured = filtered.length > 0 ? filtered[0] : "";
    }
    onImagesChange(filtered, nextFeatured);
  };

  // Set Front Image
  const handleSetFront = (imgUrl: string) => {
    onImagesChange(images, imgUrl);
  };

  // Upload MP4 Video
  const handleMp4Upload = async (file: File) => {
    if (hasYoutube) return;
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        onVideoChange({ video: url, youtubeUrl: "" });
        onMediaTypeChange("video");
      }
    } finally {
      setUploadingVideo(false);
      if (mp4InputRef.current) mp4InputRef.current.value = "";
    }
  };

  // Upload Video Thumbnail
  const handleVideoThumbnailUpload = async (file: File) => {
    setUploadingThumbnail(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        onVideoChange({ videoThumbnail: url });
      }
    } finally {
      setUploadingThumbnail(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Film size={15} className="text-[#0167D6]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
          {totalAssets} Asset(s)
        </span>
      </div>

      {/* Primary Media Type Tabs */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
          Primary Media Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onMediaTypeChange("image")}
            className={`py-2 px-3 rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
              mediaType === "image"
                ? "border-[#0167D6] bg-blue-50 text-[#0167D6] dark:bg-blue-950/40 dark:text-blue-400 shadow-xs"
                : "border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
            }`}
          >
            <ImageIcon size={14} /> Still Images
          </button>
          <button
            type="button"
            onClick={() => onMediaTypeChange("video")}
            className={`py-2 px-3 rounded-[4px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
              mediaType === "video"
                ? "border-[#0167D6] bg-blue-50 text-[#0167D6] dark:bg-blue-950/40 dark:text-blue-400 shadow-xs"
                : "border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
            }`}
          >
            <Video size={14} /> Video / Demo
          </button>
        </div>
      </div>

      {/* ── TAB 1: STILL IMAGES (MULTI-IMAGE GALLERY & THUMBNAIL SELECTOR) ── */}
      {mediaType === "image" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <Images size={14} className="text-[#0167D6]" />
              Gallery &amp; Screenshots ({images.length})
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-400">
              Multiple selection enabled
            </span>
          </div>

          {/* Hidden Multi-file Input */}
          <input
            ref={multiImagesInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleMultipleImagesUpload(e.target.files)}
          />

          {/* Clickable Drag & Drop Zone */}
          <div
            onClick={() => multiImagesInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                handleMultipleImagesUpload(e.dataTransfer.files);
              }
            }}
            className="relative group border-2 border-dashed border-[#0167D6]/40 hover:border-[#0167D6] bg-blue-50/20 hover:bg-blue-50/40 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 rounded-[4px] p-4 text-center cursor-pointer transition"
          >
            <div className="flex items-center justify-center -space-x-3 mb-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-[#0167D6] transform -rotate-6 shadow-xs">
                <ImageIcon size={14} />
              </div>
              <div className="w-9 h-9 rounded-[4px] bg-[#0167D6] flex items-center justify-center text-white z-10 shadow-md">
                {uploadingImages ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span className="text-base font-bold leading-none">+</span>
                )}
              </div>
              <div className="w-8 h-8 rounded-[4px] bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-[#0167D6] transform rotate-6 shadow-xs">
                <ImageIcon size={14} />
              </div>
            </div>

            <p className="text-xs font-bold text-slate-800 dark:text-white">
              {uploadingImages ? uploadProgress : "Click or Drag to Upload Multiple Images"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
              PNG, JPG, WEBP • Select as many images as needed
            </p>
          </div>

          {/* Uploaded Images Grid */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-gray-400">
                <span className="font-bold flex items-center gap-1 text-[#0167D6]">
                  <Sparkles size={12} /> SELECT FRONT THUMBNAIL:
                </span>
                <span className="text-[10px] italic">Click thumbnail to set as front</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((img, idx) => {
                  const isFront = img === effectiveFeatured;
                  return (
                    <div
                      key={idx}
                      className={`relative aspect-video rounded-[4px] overflow-hidden group border-2 transition cursor-pointer ${
                        isFront
                          ? "border-[#0167D6] shadow-sm ring-2 ring-blue-500/20"
                          : "border-slate-200 dark:border-gray-800 hover:border-slate-400"
                      }`}
                      onClick={() => handleSetFront(img)}
                    >
                      <img src={img} alt={`Asset ${idx + 1}`} className="w-full h-full object-cover" />

                      {/* Front Thumbnail Badge */}
                      {isFront && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-[3px] bg-[#0167D6] text-white text-[9px] font-bold shadow flex items-center gap-0.5">
                          <span>★ Front</span>
                        </div>
                      )}

                      {/* Hover Overlay with Set Front & Delete */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-between p-1.5">
                        {!isFront && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetFront(img);
                            }}
                            className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[3px] text-[9px] font-bold cursor-pointer"
                          >
                            Set Front
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-[3px] ml-auto cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: VIDEO / DEMO (YOUTUBE + DIRECT MP4 + CUSTOM THUMBNAIL) ── */}
      {mediaType === "video" && (
        <div className="space-y-4">
          {/* Slot 1: YouTube Video URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center justify-between">
              <span>YouTube Video URL (Preferred)</span>
              {hasMp4 && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Disabled (MP4 video active)
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type="url"
                disabled={hasMp4}
                placeholder={hasMp4 ? "Disabled — Clear uploaded MP4 below to use YouTube" : "https://www.youtube.com/watch?v=..."}
                value={youtubeUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  onVideoChange({
                    youtubeUrl: val,
                    ...(val.trim() ? { video: "" } : {})
                  });
                }}
                className={`w-full px-3 py-2 border rounded-[4px] text-xs font-mono transition focus:outline-none ${
                  hasMp4
                    ? "bg-slate-100 dark:bg-[#121316] border-slate-200 dark:border-gray-800 text-slate-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-white dark:bg-[#18191D] border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white focus:border-[#0167D6]"
                } ${hasYoutube && !hasMp4 ? "pr-8" : ""}`}
              />
              {hasYoutube && !hasMp4 && (
                <button
                  type="button"
                  onClick={() => onVideoChange({ youtubeUrl: "" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                  title="Clear YouTube Link"
                  aria-label="Clear YouTube Link"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {hasMp4 && (
              <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1 italic">
                To use a YouTube link, please remove the uploaded MP4 video below first.
              </p>
            )}

            {hasYoutube && isYouTubeUrl(youtubeUrl) && (
              <div className="mt-2 aspect-video rounded-[4px] overflow-hidden border border-slate-200 dark:border-gray-800 bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(youtubeUrl) || undefined}
                  className="w-full h-full"
                  title="YouTube Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Slot 2: Direct MP4 Video Upload (NO TEXT INPUT, BUTTON ONLY) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center justify-between">
              <span>Or Upload Direct MP4 Video</span>
              {hasYoutube ? (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Disabled (YouTube link active)
                </span>
              ) : uploadingVideo ? (
                <Loader2 size={12} className="animate-spin text-[#0167D6]" />
              ) : null}
            </label>

            <input
              ref={mp4InputRef}
              type="file"
              accept="video/mp4,video/webm"
              disabled={hasYoutube}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleMp4Upload(e.target.files[0])}
            />

            <button
              type="button"
              disabled={uploadingVideo || hasYoutube}
              onClick={() => !hasYoutube && mp4InputRef.current?.click()}
              className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 border text-xs font-semibold rounded-[4px] transition shadow-xs ${
                hasYoutube
                  ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-[#121316] border-slate-200 dark:border-gray-800 text-slate-400 dark:text-gray-500"
                  : "bg-white dark:bg-[#18191D] border-slate-300 dark:border-gray-700 hover:border-[#0167D6] text-slate-700 dark:text-gray-200 cursor-pointer"
              }`}
              title={hasYoutube ? "Clear the YouTube URL above to upload an MP4 video" : undefined}
            >
              {uploadingVideo ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <UploadCloud size={14} className={hasYoutube ? "text-slate-400" : "text-[#0167D6]"} />
              )}
              <span>
                {hasYoutube
                  ? "Upload MP4 (Disabled — YouTube Link Active)"
                  : uploadingVideo
                  ? "Uploading MP4 Video..."
                  : video
                  ? "Change Uploaded Video"
                  : "Upload MP4 Video"}
              </span>
            </button>

            {hasYoutube && (
              <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1 italic">
                To upload an MP4 file, please clear the YouTube URL above first.
              </p>
            )}

            {video && (
              <div className="mt-2 p-2.5 rounded-[4px] bg-slate-50 dark:bg-[#18191D] border border-slate-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Play size={13} className="text-emerald-500 shrink-0" />
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                    {video.split("/").pop()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onVideoChange({ video: "" })}
                  className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer shrink-0"
                  title="Remove video"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            {/* MP4 Player Preview */}
            {video && !hasYoutube && (
              <div className="mt-2 aspect-video rounded-[4px] overflow-hidden border border-slate-200 dark:border-gray-800 bg-black">
                <video src={video} controls className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Slot 3: Video Thumbnail Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center justify-between">
              <span>Video Thumbnail Image</span>
              {uploadingThumbnail && <Loader2 size={12} className="animate-spin text-[#0167D6]" />}
            </label>

            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleVideoThumbnailUpload(e.target.files[0])}
            />

            <button
              type="button"
              disabled={uploadingThumbnail}
              onClick={() => thumbInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-[#18191D] border border-slate-300 dark:border-gray-700 hover:border-[#0167D6] text-slate-700 dark:text-gray-200 text-xs font-semibold rounded-[4px] transition cursor-pointer shadow-xs"
            >
              {uploadingThumbnail ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <UploadCloud size={14} className="text-[#0167D6]" />
              )}
              <span>
                {uploadingThumbnail
                  ? "Uploading Thumbnail..."
                  : videoThumbnail
                  ? "Change Video Thumbnail"
                  : "Upload Video Thumbnail"}
              </span>
            </button>

            {videoThumbnail && (
              <div className="mt-2 relative rounded-[4px] overflow-hidden aspect-video border border-slate-200 dark:border-gray-800 group">
                <img src={videoThumbnail} alt="Video Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[3px] bg-white/95 dark:bg-black/75 text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/15 text-[10px] font-semibold shadow-xs backdrop-blur-xs">
                  Video Thumbnail
                </div>
                <button
                  type="button"
                  onClick={() => onVideoChange({ videoThumbnail: "" })}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-[3px] cursor-pointer shadow opacity-90 group-hover:opacity-100 transition"
                  title="Remove thumbnail"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

