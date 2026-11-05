"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  MessageSquare
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import UniversalLoader from "@/components/UniversalLoader";
import {
  ServiceClientItem,
  getServices,
  getServiceBySlug,
  DEFAULT_SERVICES,
  getServiceWhatsAppUrl
} from "@/lib/api";

interface ServiceDetailViewProps {
  slug: string;
  initialService?: ServiceClientItem | null;
}

export default function ServiceDetailView({ slug, initialService }: ServiceDetailViewProps) {
  const [service, setService] = useState<ServiceClientItem | null>(initialService || null);
  const [allServices, setAllServices] = useState<ServiceClientItem[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(!initialService);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [fetchedService, servicesList] = await Promise.all([
          initialService ? Promise.resolve(initialService) : getServiceBySlug(slug),
          getServices()
        ]);

        if (isMounted) {
          if (fetchedService) {
            setService(fetchedService);
          } else {
            const found = servicesList.find(
              s => s.slug === slug ||
                   s.slug === `${slug}-service` ||
                   slug === `${s.slug}-service`
            );
            setService(found || DEFAULT_SERVICES[0]);
          }
          if (servicesList.length > 0) {
            setAllServices(servicesList);
          }
        }
      } catch (err) {
        console.error("Error loading service detail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug, initialService]);

  if (loading) {
    return <UniversalLoader fullScreen size="lg" />;
  }

  const activeService = service || DEFAULT_SERVICES[0];

  // Other services for left sidebar navigation (filter out current)
  const otherServices = allServices.filter(
    s => s.slug !== activeService.slug && s._id !== activeService._id
  );
  const sidebarServicesList = otherServices.length > 0 ? otherServices : allServices;
  const hasMoreServices = sidebarServicesList.length > 6;
  const visibleServices = sidebarServicesList.slice(0, 6);

  const heroImage =
    activeService.bannerImage ||
    activeService.image ||
    "/assets/web-CPDVLYNo.jpeg";

  return (
    <div className="bg-black text-white">
      {/* Hero Banner */}
      <PageBanner
        title={activeService.title}
        subtitle={
          activeService.bannerSubtitle ||
          "Custom, scalable, and high-performance digital platforms tailored to your business"
        }
      />

      {/* Main Section - Reduced padding (0.8x) */}
      <section className="bg-[#141416] py-10 sm:py-14">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-10">
            {/* Left Sidebar - Reduced spacing (0.8x) & rounded-[4px] */}
            <aside className="w-full lg:w-[32%] space-y-4 shrink-0">
              {/* Other Services Navigation Card */}
              <div className="bg-[#1A1A1C] border border-gray-800 p-5 sm:p-6 rounded-[4px] shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-3 flex items-center justify-between">
                  <span>Our Services</span>
                  <span className="text-[11px] font-normal text-gray-500">{allServices.length} offerings</span>
                </h3>
                <nav className="space-y-2">
                  {visibleServices.map((srv) => (
                    <Link
                      key={srv._id || srv.slug}
                      href={`/services/${srv.slug}`}
                      className="flex justify-between items-center text-gray-300 py-2 px-2.5 rounded-[4px] hover:bg-white/5 hover:text-[#0167D6] transition-all border-b border-gray-800/40 group text-xs sm:text-sm"
                    >
                      <span className="font-medium line-clamp-1 group-hover:translate-x-1 transition-transform">
                        {srv.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0167D6] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}

                  {hasMoreServices && (
                    <div className="pt-2">
                      <Link
                        href="/services"
                        className="flex justify-between items-center text-[#0167D6] hover:text-white py-2 px-2.5 rounded-[4px] hover:bg-[#0167D6]/20 transition-all font-semibold text-xs sm:text-sm group border border-[#0167D6]/30 bg-[#0167D6]/10"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">See more</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#0167D6] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </nav>
              </div>

              {/* Call Expert & Hire Us Box */}
              <div
                style={{ backgroundImage: "url('/assets/sidebar-phone-D7l_BbZM.webp')" }}
                className="bg-cover bg-center rounded-[4px] p-6 text-center relative overflow-hidden h-[300px] flex flex-col items-center justify-center border border-gray-800 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/95 via-black/85 to-black/75 z-0" />
                <div className="relative z-10 px-2 w-full">
                  <a
                    href="tel:+8801973590937"
                    className="w-12 h-12 rounded-[4px] bg-red-600 hover:bg-red-500 transition-transform hover:scale-105 flex items-center justify-center text-white mx-auto mb-4 shadow-xl"
                    aria-label="Call Okobiz Experts"
                  >
                    <Phone className="w-6 h-6" />
                  </a>
                  <p className="text-white text-sm font-semibold mb-1">
                    Need help? Contact our experts
                  </p>
                  <a
                    href="tel:+8801973590937"
                    className="text-lg font-extrabold text-white tracking-wide hover:underline block mb-4"
                  >
                    +880 1973-590937
                  </a>

                  {/* Sidebar Hire Us Button */}
                  <a
                    href={getServiceWhatsAppUrl(activeService.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0167D6] hover:bg-[#0055b8] text-white font-bold text-xs uppercase tracking-wider rounded-[4px] transition shadow-lg"
                  >
                    <MessageSquare size={14} />
                    <span>Hire Us on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Satisfaction Guarantee note */}
              <div className="bg-[#1A1A1C] border border-gray-800 text-gray-300 p-5 rounded-[4px] shadow-lg">
                <div className="flex items-center gap-2 mb-2 text-white font-bold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-[#0167D6]" />
                  <span>Quality & Satisfaction Guarantee</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  We guarantee verified code standards, rapid turnaround, and dedicated milestone tracking for every client project.
                </p>
              </div>
            </aside>

            {/* Right Main Content - Reduced spacing & rounded-[4px] */}
            <main className="w-full lg:w-[68%] min-w-0">
              {/* Cover Hero Banner Image */}
              <div className="rounded-[4px] overflow-hidden border border-gray-800 shadow-2xl mb-5 bg-[#181A1D]">
                <img
                  src={heroImage}
                  alt={activeService.title}
                  className="w-full h-auto max-h-[420px] object-cover rounded-[4px]"
                />
              </div>

              {/* Service Full Narrative Description */}
              <div className="mb-5">
                {activeService.fullDesc ? (
                  <div
                    className="text-gray-300 text-sm sm:text-base leading-relaxed text-justify space-y-3.5 prose prose-invert max-w-none [&_p]:mb-3.5 [&_strong]:text-white [&_h2]:text-lg sm:[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#0167D6] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_a]:text-[#0167D6] [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: activeService.fullDesc }}
                  />
                ) : (
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed text-justify">
                    {activeService.shortDesc}
                  </p>
                )}
              </div>

              {/* PROMINENT HIRE US CALL TO ACTION BOX */}
              <div className="bg-gradient-to-r from-[#0167D6]/20 via-[#181A1D] to-[#181A1D] border border-[#0167D6]/50 p-5 sm:p-6 rounded-[4px] mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[#0167D6] uppercase tracking-wider">
                      Ready to Start Your Project?
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    Hire Us for {activeService.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Get an instant quote, technical consultation, and project timeline with our senior team.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <a
                    href={getServiceWhatsAppUrl(activeService.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0167D6] hover:bg-[#0055b8] text-white font-bold text-xs uppercase tracking-wider rounded-[4px] transition shadow-lg shadow-blue-900/40"
                  >
                    <MessageSquare size={14} />
                    <span>Hire Us</span>
                  </a>
                  <a
                    href="tel:+8801973590937"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs rounded-[4px] border border-gray-700/80 transition"
                  >
                    <Phone size={13} />
                    <span>Call Now</span>
                  </a>
                </div>
              </div>

              {/* Why Choose Us Checklist Card */}
              {activeService.whyChooseUs && activeService.whyChooseUs.length > 0 && (
                <div className="bg-[#181A1D] border border-gray-800 rounded-[4px] p-5 sm:p-6 mb-5 shadow-xl">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#0167D6]" />
                    <span>Why Choose Us?</span>
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
                    {activeService.whyChooseUs.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0167D6] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-semibold">{item.title}:</strong>{" "}
                          <span className="text-gray-300 leading-relaxed">{item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technology Frameworks & Tools Badges */}
              {activeService.techStack && activeService.techStack.length > 0 && (
                <div className="border border-gray-800 bg-[#181A1D] rounded-[4px] p-5 sm:p-6 mb-5 shadow-xl">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-[#0167D6]" />
                    <span>Technology Frameworks & Tools</span>
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Industry-leading tools and architectures leveraged to build high-performance solutions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeService.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-[4px] bg-[#141416] border border-gray-700/80 text-gray-200 text-xs font-semibold hover:border-[#0167D6] hover:text-[#0167D6] transition"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* FULL SECTION: EDITABLE PRICING PACKAGES LIKE PRODUCTS PAGE */}
      {activeService.pricingPlans && activeService.pricingPlans.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#0E0F12] border-t border-gray-800/80">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0167D6] px-3.5 py-1 bg-[#0167D6]/20 rounded-[4px] inline-block mb-3 border border-[#0167D6]/30">
                Transparent & Predictable Pricing
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Choose the Ideal Plan for {activeService.title}
              </h2>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                All plans include dedicated senior engineer oversight, milestone reviews, and post-delivery support. Select a package below to order or chat with our team on WhatsApp.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {activeService.pricingPlans.map((plan, idx) => {
                const planWhatsappUrl = getServiceWhatsAppUrl(activeService.title, undefined, plan.name);
                const hasDiscount = plan.discountPrice && plan.discountPrice > plan.price;
                const savingsPct = hasDiscount
                  ? Math.round(((plan.discountPrice - plan.price) / plan.discountPrice) * 100)
                  : 0;

                return (
                  <div
                    key={idx}
                    className={`relative rounded-[4px] p-7 flex flex-col justify-between transition-all duration-300 ${
                      plan.isPopular
                        ? "bg-[#181A1E] border-2 border-[#0167D6] shadow-2xl shadow-blue-900/30 scale-[1.02] z-10"
                        : "bg-[#111215] border border-gray-800 hover:border-gray-700 shadow-xl"
                    }`}
                  >
                    {/* Popular Ribbon */}
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0167D6] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-[4px] uppercase tracking-wider shadow-lg">
                        ⭐ Most Popular Choice
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-extrabold text-white">
                          {plan.name}
                        </h3>
                        {plan.badge && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-[4px] bg-gray-800 text-gray-300 border border-gray-700">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 min-h-[36px] mb-6">
                        {plan.description || "Comprehensive service scope designed for maximum ROI and delivery excellence."}
                      </p>

                      {/* Pricing block */}
                      <div className="pb-6 mb-6 border-b border-gray-800/80">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white">
                            ৳{plan.price?.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              ৳{plan.discountPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">
                            {plan.period || "One-Time Setup"}
                          </span>
                          {savingsPct > 0 && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-[4px]">
                              Save {savingsPct}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 mb-8">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Included Deliverables:
                        </p>
                        <ul className="space-y-2.5">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Order on WhatsApp CTA */}
                    <a
                      href={planWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 px-4 rounded-[4px] text-xs font-bold transition flex items-center justify-center gap-2 text-center shadow-md ${
                        plan.isPopular
                          ? "bg-[#0167D6] hover:bg-[#0055b8] text-white shadow-blue-900/40"
                          : "bg-gray-800 hover:bg-gray-700 text-white"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Select {plan.name} Package</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Talk With Us CTA */}
      <TalkCta />
    </div>
  );
}
