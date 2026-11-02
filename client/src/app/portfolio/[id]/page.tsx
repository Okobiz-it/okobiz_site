"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Building,
  CheckCircle,
  Play,
  Layers,
  Sparkles,
  TrendingUp,
  Share2
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import { PortfolioProject } from "@/data/mockData";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { renderRichText } from "@/lib/richText";

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
        const res = await fetch(`${adminUrl}/api/themes`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const match = json.data.find((p: any) => p._id === id);
          if (match) {
            setProject({
              _id: match._id,
              title: match.websiteTitle || match.title,
              category: match.category || "Web Applications",
              clientName: match.clientName || "Enterprise Client",
              completionYear: "2024",
              mediaType: match.mediaType || (match.video ? "video" : "image"),
              thumbnail: match.photo || "/assets/bdhajj-D468QQtK.png",
              videoUrl: match.video || "",
              videoThumbnail: match.videoThumbnail || match.photo || "",
              liveUrl: match.websiteLink || "",
              shortDescription: match.description || "",
              fullDescription: match.description || "",
              challenge: match.challenge || "",
              solution: match.solution || "",
              features: match.features || [],
              techStack: ["Next.js", "TypeScript", "Tailwind CSS", "MongoDB"],
              results: ["High Performance Scalability", "99.9% Uptime Verified"]
            });
          }
        }
      } catch (e) {}
    };
    fetchProject();
  }, [id]);

  if (!project) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3368B2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isVideo = project.mediaType === "video" || !!project.videoUrl;
  const isYt = isYouTubeUrl(project.videoUrl);
  const ytEmbedUrl = isYt ? getYouTubeEmbedUrl(project.videoUrl) : null;
  const displayPoster =
    project.videoThumbnail ||
    (isYt ? getYouTubeThumbnailUrl(project.videoUrl) : null) ||
    project.thumbnail;

  return (
    <div className="bg-black text-white min-h-screen">
      <PageBanner
        title={project.title}
        subtitle={`Case Study • ${project.category} • Delivered for ${project.clientName}`}
      />

      <article className="py-16 md:py-24 bg-[#121316]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button and quick actions */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-800">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Portfolio</span>
            </Link>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[2px] bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition"
              >
                <span>Live Project Demo</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Project Meta Details Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-[#16171B] border border-gray-800 rounded-[2px] mb-12 shadow-xl">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Client</p>
              <p className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                <Building size={14} className="text-[#3368B2]" />
                {project.clientName}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Category</p>
              <p className="text-sm font-bold text-[#3368B2] mt-1">{project.category}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Delivered In</p>
              <p className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                {project.completionYear}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Media Type</p>
              <p className="text-sm font-bold text-white mt-1">
                {isVideo ? (isYt ? "YouTube Video Case" : "Video Case Study") : "Web Showcase"}
              </p>
            </div>
          </div>

          {/* Media Showcase: YouTube Iframe, HTML5 Video, or Image */}
          <div className="mb-14 rounded-[2px] overflow-hidden border border-gray-800 bg-black shadow-2xl relative">
            {isVideo && project.videoUrl ? (
              isYt && ytEmbedUrl ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={ytEmbedUrl}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                  <video
                    src={project.videoUrl}
                    poster={displayPoster}
                    controls
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )
            ) : (
              <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
                <img
                  src={displayPoster}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Project Narrative */}
          <div className="space-y-12">
            {/* Overview */}
            <div>
              <span className="text-[#0077FF] text-xs font-bold uppercase tracking-widest block mb-2">
                - Overview -
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Project Overview & Impact
              </h2>
              <div
                className="text-gray-300 text-sm sm:text-base leading-relaxed rich-text-content"
                dangerouslySetInnerHTML={{
                  __html: renderRichText(project.fullDescription || project.shortDescription)
                }}
              />
            </div>

            {/* Challenge & Solution Grid */}
            {(project.challenge || project.solution) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.challenge && (
                  <div className="p-6 rounded-[2px] bg-[#16171B] border border-gray-800/90 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      The Engineering Challenge
                    </h3>
                    <div
                      className="text-xs sm:text-sm text-gray-400 leading-relaxed rich-text-content"
                      dangerouslySetInnerHTML={{
                        __html: renderRichText(project.challenge)
                      }}
                    />
                  </div>
                )}

                {project.solution && (
                  <div className="p-6 rounded-[2px] bg-[#16171B] border border-gray-800/90 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0077FF]" />
                      Our Custom Solution
                    </h3>
                    <div
                      className="text-xs sm:text-sm text-gray-400 leading-relaxed rich-text-content"
                      dangerouslySetInnerHTML={{
                        __html: renderRichText(project.solution)
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Key Deliverables & Features */}
            {project.features && project.features.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#3368B2]" />
                  Key Features & Deliverables
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {project.features.map((feat, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-[2px] bg-[#16171B] border border-gray-800 flex items-start gap-3"
                    >
                      <CheckCircle size={16} className="text-[#3368B2] mt-0.5 shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-300 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Layers size={20} className="text-[#3368B2]" />
                Technology Stack Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-[2px] bg-[#16171B] border border-gray-800 text-xs font-semibold text-gray-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Business Impact / Key Results */}
            {project.results && project.results.length > 0 && (
              <div className="p-8 rounded-[2px] bg-gradient-to-r from-blue-950/30 to-[#16171B] border border-[#3368B2]/30 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-400" />
                  Key Results & Business Metrics
                </h3>
                <ul className="space-y-2.5">
                  {project.results.map((res, i) => (
                    <li key={i} className="text-xs sm:text-sm text-gray-300 flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* More Projects Navigation */}
          <div className="mt-20 pt-10 border-t border-gray-800 flex items-center justify-between">
            <Link
              href="/portfolio"
              className="text-xs sm:text-sm font-bold text-[#3368B2] hover:text-blue-400 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Explore All Projects</span>
            </Link>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-bold text-white hover:text-[#3368B2] flex items-center gap-1.5"
              >
                <span>Visit Live Application</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </article>

      <TalkCta />
    </div>
  );
}
