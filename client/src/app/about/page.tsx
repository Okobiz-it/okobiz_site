import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Target, Eye, ShieldCheck, PhoneCall, ArrowRight } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";

export const metadata: Metadata = {
  title: "About Us - okobiz",
  description:
    "okobiz, a premier software firm, boasts a team of adept professionals specializing in dynamic digital media, graphic content, web design & development, logo creation, and branding.",
  keywords: [
    "okobiz about",
    "software company profile",
    "Bangladeshi software agency",
    "web design firm",
    "MD Sorower Jahan Shameem",
    "Yeasmin Ara"
  ],
};

export default function AboutPage() {
  const serviceOfferings = [
    {
      title: "Website Design",
      image: "/assets/app-development-01-CVsYJoHh.webp",
      link: "/services",
    },
    {
      title: "Website Development",
      image: "/assets/web-development-01-YVpNVtyB.webp",
      link: "/services",
    },
    {
      title: "Brand & Logo Identity",
      image: "/assets/branding-01-C63SjeXF.webp",
      link: "/services",
    },
    {
      title: "Static Design",
      image: "/assets/staticdesign-01-ClBDGJkC.webp",
      link: "/services",
    },
    {
      title: "3D Modeling Design",
      image: "/assets/3dmodeling-01-DQkhQyBI.webp",
      link: "/services",
    },
    {
      title: "Motion Design",
      image: "/assets/motion-01-BIzEjDQF.webp",
      link: "/services",
    },
    {
      title: "SEO / GDN / DSP",
      image: "/assets/seo-dsp-01-C_uYzbg3.webp",
      link: "/services",
    },
  ];

  return (
    <div className="bg-black text-white">
      {/* Page Banner */}
      <PageBanner title="About Okobiz" />

      {/* Intro Section */}
      <section className="py-20 bg-white text-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2 flex justify-center">
              <img
                src="/assets/about-BPfvng5e.webp"
                alt="About Okobiz"
                className="rounded-xl shadow-2xl max-w-full h-auto object-cover"
              />
            </div>

            <div className="w-full lg:w-1/2">
              <span className="text-sm font-bold text-[#0167D6] uppercase tracking-wider block mb-2">
                okobiz Team Works For You
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                An Agency That’s Been Solving Business Problems for Brands
              </h2>

              <p className="text-gray-600 text-base leading-relaxed mb-6 text-justify">
                <strong className="text-[#0167D6]">okobiz</strong>, a premier software firm, boasts a team of adept professionals specializing in dynamic digital media, graphic content, web design, logo creation, and branding. Our global clientele includes esteemed brands, showcasing our expertise in crafting compelling visual experiences.
              </p>

              <p className="text-gray-600 text-base leading-relaxed mb-6 text-justify">
                We are a dynamic agency dedicated to resolving brand challenges. Our close-knit, rapidly expanding team comprises digital specialists well-versed in cutting-edge development and marketing trends. With a knack for delivering impactful digital solutions, we collaborate with global brands to develop products and marketing strategies aligned with their business objectives.
              </p>

              <p className="text-gray-900 font-semibold text-base mb-8">
                Want a successful digital campaign or eye-catching website with{" "}
                <span className="text-[#0167D6]">MODERN TECHNOLOGIES?</span> We can make it happen.
              </p>

              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#3368B2] hover:bg-[#0167D6] text-white font-bold text-sm uppercase tracking-wider rounded-md transition-all shadow-md"
              >
                <span>Get In Touch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Offerings Grid */}
      <section className="py-20 bg-[#141416] border-t border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 text-center">
          <p className="text-xs sm:text-sm uppercase text-[#3368B2] font-bold tracking-widest mb-2">
            Services We&apos;re Offering
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12">
            We&apos;re Dedicated to Serve You All Time
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {serviceOfferings.map((srv, idx) => (
              <Link
                key={idx}
                href={srv.link}
                className="bg-[#181A1D] border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-between hover:border-[#3368B2] hover:-translate-y-1 transition-all group"
              >
                <div className="w-20 h-20 flex items-center justify-center mb-3">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="max-h-16 w-auto object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-200 group-hover:text-[#0167D6] text-center">
                  {srv.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our IT Journey Section */}
      <section className="py-20 bg-[#18191D] border-t border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2">
              <span className="text-xs sm:text-sm font-bold text-[#3368B2] uppercase tracking-widest block mb-2">
                Company Legacy
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 uppercase tracking-tight">
                Our IT <br />
                <span className="text-[#3368B2]">Journey</span>
              </h2>

              <p className="text-gray-300 text-base leading-relaxed mb-6 text-justify">
                Nowadays, <strong className="text-white">okobiz</strong> has become one of the fastest growing companies in the industry. okobiz&apos;s team of professionals successfully work with global clients across North America, Europe, the Middle East, and Asia.
              </p>

              <p className="text-gray-300 text-base leading-relaxed mb-6 text-justify">
                Led by <strong className="text-white">MD Sorower Jahan Shameem & Yeasmin Ara</strong>, okobiz offers a comprehensive range of technology and marketing services to help clients scale effortlessly. With determination and vision, okobiz has become well-known and sought-after by brands worldwide.
              </p>
            </div>

            <div className="w-full lg:w-1/2 relative flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                <img
                  src="/assets/journey-Crn2qHA1.webp"
                  alt="okobiz journey"
                  className="w-full h-auto object-cover"
                />
                <div className="bg-[#3368B2] py-3 px-6 text-center text-white font-bold tracking-wider text-sm sm:text-base absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md shadow-lg whitespace-nowrap">
                  Leading the Digital Revolution
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It's Going */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex justify-center">
              <img
                src="/assets/okobiz-hradmin-Du9RdoDi.webp"
                alt="okobiz HR and team"
                className="rounded-2xl border border-gray-800 shadow-2xl max-w-full h-auto"
              />
            </div>

            <div className="lg:col-span-6">
              <span className="text-xs sm:text-sm font-bold text-[#3368B2] uppercase tracking-widest block mb-2">
                Present & Future
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 uppercase tracking-tight">
                How It&apos;s <br />
                <span className="text-[#3368B2]">Going</span>
              </h2>

              <p className="text-gray-300 text-base leading-relaxed mb-6 text-justify">
                Moving forward to the present, <strong className="text-white">okobiz</strong> has matured into one of the fastest-growing agencies in the business, with a staff of more than 20 committed experts passionate about assisting multinational corporations and fast-scaling startups.
              </p>

              <p className="text-gray-300 text-base leading-relaxed mb-6 text-justify">
                We provide an extensive suite of services—from cloud architecture and mobile apps to brand identity and programmatic advertising—allowing clients to consolidate all their tech needs under one trusted partner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Promises Section */}
      <section className="py-20 bg-[#181A1D] border-t border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-[#141416] border border-gray-800 p-8 rounded-xl relative hover:border-[#3368B2] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#3368B2]/20 border border-[#3368B2]/40 flex items-center justify-center text-[#3368B2] mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">
                Our Mission
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our goal is to keep getting better as a professional agency. We aim to help our clients and partners with top-notch solutions and services, so they can innovate, create, and achieve measurable profitability.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-[#141416] border border-gray-800 p-8 rounded-xl relative hover:border-[#3368B2] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#3368B2]/20 border border-[#3368B2]/40 flex items-center justify-center text-[#3368B2] mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">
                Our Vision
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We aim to be a highly trusted and respected software company and marketing agency worldwide. Our goal is to offer innovative solutions that boost clients&apos; profits and streamline operations for SME and enterprise businesses alike.
              </p>
            </div>

            {/* Promises */}
            <div className="bg-[#141416] border border-gray-800 p-8 rounded-xl relative hover:border-[#3368B2] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#3368B2]/20 border border-[#3368B2]/40 flex items-center justify-center text-[#3368B2] mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">
                Our Promises
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We&apos;re all about clear communication and top-notch service. Our approach gives clients straightforward reports and in-depth analytics so they can manage investments wisely and see real, verifiable results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call for more info bar */}
      <section className="bg-[#004282] py-8 border-y border-blue-600/30">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-white">
            <PhoneCall className="w-8 h-8 text-blue-300" />
            <div>
              <p className="text-xs uppercase tracking-wider text-blue-200">Call For More Info</p>
              <a href="tel:+8801973590937" className="text-lg font-bold hover:underline">
                +880 1973-590937
              </a>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-base sm:text-lg font-bold text-white">
              Let&apos;s Collaborate on Something Awesome!
            </p>
          </div>

          <a
            href="https://wa.me/+8801973590937"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white text-[#004282] hover:bg-gray-100 font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow-md"
          >
            Apply for Meeting
          </a>
        </div>
      </section>

      {/* Talk CTA */}
      <TalkCta />
    </div>
  );
}
