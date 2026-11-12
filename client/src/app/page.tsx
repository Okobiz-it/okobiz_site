
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import TalkCta from "@/components/TalkCta";
import { Play, ArrowRight, Monitor, PenTool, BarChart, Plus, Minus, Phone } from "lucide-react";
import ClientStepSlider from "@/components/ClientStepSlider";
import { getHeroSlides, getFaqs, HeroSlideItem, FaqItemType } from "@/lib/api";

const TICKER_ITEMS = [
  "Portfolio Design", "App Design", "Mobile App Development", 
  "Graphic Design", "Motion Design", "Social Advertising", 
  "Fan Group", "SEO", "Branding", "Logo Design", "Website Design"
];

const TICKER_ITEMS_BLACK = [
  "Review Websites", "Directory Websites", "Custom Websites", 
  "E-commerce Websites", "Business Websites", "Portfolio Websites", 
  "Blog Websites", "Agency Websites"
];

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItemType[]>([]);

  useEffect(() => {
    const loadLiveData = async () => {
      try {
        const liveSlides = await getHeroSlides();
        if (liveSlides && liveSlides.length > 0) {
          setHeroSlides(liveSlides);
        }
      } catch (e) {}

      try {
        const liveFaqs = await getFaqs();
        if (liveFaqs && liveFaqs.length > 0) {
          setFaqs(liveFaqs);
        }
      } catch (e) {}
    };

    loadLiveData();
  }, []);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);


  return (
    <div className="bg-[#18191D] text-white min-h-screen font-sans overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative h-screen flex flex-col justify-between overflow-hidden">
        {/* Background Slides */}
        {heroSlides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={slide.img} alt={slide.title} className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${currentSlide === idx ? 'scale-110' : 'scale-100'}`} />
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
        ))}
        
        {/* Wave overlay */}
        <img src="https://res.cloudinary.com/dccui8s58/image/upload/v1790853389/okobiz/assets/background-Bw2fnejs.png" alt="wave" className="absolute w-full z-10 opacity-45 hidden lg:block" />
        
        {/* Rotating Stars */}
        <div className="absolute hidden lg:block top-40 lg:left-[90px] xl:left-36 2xl:left-[245px] z-10 text-white animate-[spin_15s_linear_infinite]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <div className="absolute hidden lg:block bottom-1/2 lg:right-[75px] xl:right-16 2xl:right-[180px] z-10 text-white animate-[spin_15s_linear_infinite]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>

        {/* Title and Buttons */}
        <div className="relative z-20 text-center px-4 mt-[25vh] md:mt-[30vh]">
          <div className="min-h-[140px] flex flex-col items-center justify-center md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] mx-auto">
            <h1 className="text-[32px] md:text-[50px] 2xl:text-[60px] font-bold uppercase leading-[1.2] mb-8">
              {heroSlides[currentSlide]?.title || "Drive Business, Elevate Success"}
            </h1>
            <button className="bg-[#3368B2] hover:bg-blue-600 transition-colors text-white rounded-full py-3 md:py-4 px-8 md:px-10 uppercase font-bold flex items-center gap-3 mx-auto text-[13px] md:text-sm tracking-widest shadow-lg hover:shadow-blue-500/50">
              More Information
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        
        {/* Play video popup button */}
        <div className="absolute bottom-[28%] lg:bottom-[32%] left-1/2 transform -translate-x-1/2 z-30">
          <button className="w-14 h-14 md:w-16 md:h-16 bg-[#F43F5E] rounded-full flex items-center justify-center shadow-[0_0_20px_#F43F5E] hover:scale-110 transition-transform">
            <Play size={24} fill="white" className="ml-1 text-white" />
          </button>
        </div>

        {/* Tickers - High-contrast Signature Branding in both Light & Dark modes */}
        <div className="absolute bottom-0 w-full z-20 flex flex-col">
          <div
            className="home-ticker-yellow bg-[#FFFF00] text-black py-3.5 sm:py-4 overflow-hidden flex select-none"
            style={{ backgroundColor: "#FFFF00", color: "#000000" }}
          >
            <div className="animate-marquee whitespace-nowrap flex items-center font-bold text-[14px] sm:text-[16px]">
              {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                  {TICKER_ITEMS.map((item, idx) => (
                    <span key={idx} className="mx-6 flex items-center">
                      ★ <span className="mx-6 uppercase tracking-wider">{item}</span>
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div
            className="home-ticker-black bg-black text-[#FFFF00] py-3.5 sm:py-4 overflow-hidden flex border-t border-[#222] select-none"
            style={{ backgroundColor: "#000000", color: "#FFFF00" }}
          >
            <div className="animate-marquee-reverse whitespace-nowrap flex items-center font-bold text-[14px] sm:text-[16px]">
              {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                  {TICKER_ITEMS_BLACK.map((item, idx) => (
                    <span key={idx} className="mx-6 flex items-center">
                      ★ <span className="mx-6 uppercase tracking-wider">{item}</span>
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="bg-[#181A1D] py-16 border-b border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center border border-gray-800 p-8 rounded-md bg-[#131417] shadow-sm">
            <span className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">2018</span>
            <span className="text-slate-300 text-sm sm:text-base font-semibold">Journey Started</span>
          </div>
          <div className="flex flex-col items-center border border-gray-800 p-8 rounded-md bg-[#131417] shadow-sm">
            <span className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">150</span>
            <span className="text-slate-300 text-sm sm:text-base font-semibold">Happy Clients</span>
          </div>
          <div className="flex flex-col items-center border border-gray-800 p-8 rounded-md bg-[#131417] shadow-sm">
            <span className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">20</span>
            <span className="text-slate-300 text-sm sm:text-base font-semibold">Team Members</span>
          </div>
          <div className="flex flex-col items-center border border-gray-800 p-8 rounded-md bg-[#131417] shadow-sm">
            <span className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">6+</span>
            <span className="text-slate-300 text-sm sm:text-base font-semibold">Years of Excellence</span>
          </div>
        </div>
      </section>

      {/* 3. Our Clients */}
      <section className="py-16 md:py-24 relative bg-[#131417] bg-cover bg-no-repeat bg-center overflow-hidden" style={{ backgroundImage: "url('https://res.cloudinary.com/dccui8s58/image/upload/v1790853389/okobiz/assets/background-Bw2fnejs.png')" }}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-[#3368B2] font-semibold text-xs sm:text-sm tracking-widest uppercase mb-2 block">
              TRUSTED CLIENTS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide">
              Our Clients
            </h2>
          </div>

          {/* 5 Clients in One Window Step Slider (0.8x smaller circles, pause 1s, move 1 to the right) */}
          <ClientStepSlider />

          {/* See more link right-aligned within the fixed width container */}
          <div className="text-right mt-4 md:mt-6 pr-2 sm:pr-4">
            <Link 
              href="/ourclients" 
              className="text-white hover:text-[#3368B2] font-semibold text-sm sm:text-base transition inline-flex items-center gap-2 group"
            >
              <span>See more</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-200 text-[#3368B2]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Three Core Services Cards */}
      <section className="py-16 bg-[#131417]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Website & App Development', desc: 'We offer professional website and app development services that are suited to your business requirements.', icon: Monitor, link: '/website-app-development-service' },
            { title: 'Creative Solution', desc: 'Our visual and motion design solutions will help to elevate your brand. We bring your ideas to life.', icon: PenTool, link: '/graphics-solution-service' },
            { title: 'Digital Marketing', desc: 'Our digital marketing services will help you increase your internet visibility. We specialize in connecting you with your target audience.', icon: BarChart, link: '/digital-marketing-service' }
          ].map((srv, i) => (
            <div key={i} className="bg-[#18191D] border border-gray-800 p-10 rounded-lg hover:-translate-y-2 transition-transform duration-300 group flex flex-col justify-between h-full">
              <div>
                <srv.icon size={48} className="text-[#3368B2] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4 line-clamp-2 text-white">{srv.title}</h3>
                <p className="text-slate-300 mb-8 leading-relaxed text-[15px] sm:text-base line-clamp-3 overflow-hidden text-ellipsis font-normal">{srv.desc}</p>
              </div>
              <Link href={srv.link} className="inline-block bg-[#222327] hover:bg-[#3368B2] text-white px-6 py-2 rounded font-semibold text-sm transition-colors border border-gray-700 hover:border-[#3368B2] self-start">
                READ MORE <span className="text-[#3368B2] group-hover:text-white ml-1">+</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Special Discount For Your First Project - Web Design & Development */}
      <section className="py-20 lg:py-24 bg-[#111215] relative overflow-hidden border-y border-gray-800/80">
        {/* Subtle geometric/hex backdrop vectors on left and right */}
        <div
          className="absolute left-0 top-0 bottom-0 w-80 opacity-20 pointer-events-none bg-no-repeat bg-left-center select-none"
          style={{ backgroundImage: "url('/assets/pattern-000-DD9OVOOk.png')" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-80 opacity-20 pointer-events-none bg-no-repeat bg-right-center select-none"
          style={{ backgroundImage: "url('/assets/pattern-000-DD9OVOOk.png')" }}
        />

        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-14">
          {/* Left Column: Icon, Header, Paragraph, Slanted Contact Us Button */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Vector Selection Icon from design */}
            <div className="w-12 h-12 bg-[#1A3A6B] rounded-[8px] border border-blue-500/40 flex items-center justify-center mb-6 shadow-md shadow-blue-900/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="13" height="13" rx="1.5" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3 2" />
                <rect x="3" y="3" width="3.5" height="3.5" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1" />
                <rect x="14.5" y="3" width="3.5" height="3.5" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1" />
                <rect x="3" y="14.5" width="3.5" height="3.5" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1" />
                <rect x="14.5" y="14.5" width="3.5" height="3.5" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1" />
                <path d="M7 17L12 12M12 12V15M12 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12L19 19L16 20L19 22L17.5 23L14.5 21L13 23L12 12Z" fill="white" />
              </svg>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-[1.25] mb-6 tracking-tight">
              Special Discount For your frist Project<br />
              <span className="text-white">Web Design &amp; Development.</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl font-normal">
              Our commitment to your success goes beyond words—it's reflected in our actions. From personalized strategies tailored to your objectives to ongoing support and optimization efforts, we are fully invested in helping you achieve your goals and maximizing the value of our partnership.
            </p>

            {/* Chamfered/Slanted Parallelogram Contact Us Button matching design */}
            <Link href="/contact-us" className="inline-block relative group select-none">
              <div
                className="bg-[#0167D6] hover:bg-blue-600 transition-all duration-200 px-8 sm:px-10 py-3.5 shadow-lg shadow-blue-600/30 flex items-center gap-2.5 text-white font-bold text-sm sm:text-base tracking-wider uppercase group-hover:brightness-110"
                style={{
                  clipPath: "polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)",
                }}
              >
                <span>CONTACT US</span>
                <Phone size={17} className="inline ml-1" />
              </div>
            </Link>
          </div>

          {/* Right Column: 3D Smartphone & UI/UX 35% OFF graphic */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative max-w-[460px] lg:max-w-[500px] w-full">
              <img
                src="https://res.cloudinary.com/dccui8s58/image/upload/v1790853402/okobiz/assets/discount-banner-_i19yyC6.png"
                alt="Special Discount 35% Off Web Design & Development"
                className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(1,103,214,0.35)] animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Creative Graphics Solution */}
      <section className="py-20 bg-[#131417]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white border-b-2 border-[#0167D6] inline-block pb-2">Creative Graphics Solution</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { t: 'Brand & Logo Identity', d: 'Brand identity encompasses how a brand visually, verbally, and emotionally represents itself...', i: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790853433/okobiz/assets/pattern-000-DD9OVOOk.png' },
              { t: '3D & Motion Design', d: 'We specialize in 3D & Motion Design services to fulfill our clients visual communication needs.', i: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790853433/okobiz/assets/pattern-000-DD9OVOOk.png' },
              { t: 'Static content', d: 'We specialize in Graphic Design services crafted to meet our clients visual communication needs.', i: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790853433/okobiz/assets/pattern-000-DD9OVOOk.png' }
            ].map((f, i) => (
              <div key={i} className="bg-[#18191D] p-8 border border-gray-800 rounded-[4px] group hover:border-[#0167D6] transition">
                <div className="w-16 h-16 bg-[#222327] rounded-[4px] flex items-center justify-center mb-6 group-hover:bg-[#0167D6] transition-colors">
                  <PenTool className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{f.t}</h3>
                <p className="text-slate-300 text-[15px] sm:text-base leading-relaxed font-normal">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Digital Marketing & FAQ */}
      <section className="py-20 bg-[#18191D]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white border-b-2 border-[#0167D6] inline-block pb-2">Digital Marketing</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-800 rounded-lg overflow-hidden mb-24">
            {[
              { t: 'Social Media Advertising', d: 'Comprehensive suite including creating targeted advertising campaigns, precise audience targeting...', icon: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790852898/okobiz/assets/social-BBufWNV2.png' },
              { t: 'SEO & DOM', d: 'Search Engine Optimization enhances website visibility on Google, driving organic traffic.', icon: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790852895/okobiz/assets/seo-2-Chqa_ILp.png' },
              { t: 'DSP', d: 'Advanced targeting and real-time bidding for optimized programmatic campaigns across ad exchanges.', icon: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790852893/okobiz/assets/digital-advertising-BPpRew5e.png' }
            ].map((m, i) => (
              <div key={i} className="bg-[#131417] p-10 border-r border-gray-800 last:border-r-0 hover:bg-[#1a1c21] transition relative group">
                <div className="absolute inset-0 bg-[#3368B2] w-0 group-hover:w-full transition-all duration-300 ease-out z-0 opacity-90"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 mb-6">
                    <BarChart size={48} className="text-[#3368B2] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{m.t}</h3>
                  <p className="text-slate-300 group-hover:text-white/95 leading-relaxed text-[15px] sm:text-base font-normal">{m.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#3368B2] text-sm tracking-wider font-semibold mb-2">- WHAT WE DO -</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">Your Reliable Partner for Talent Strategy and Success.</h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-800 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                      className={`w-full text-left px-6 py-4 flex justify-between items-center font-semibold transition-colors ${activeFaq === idx ? 'bg-[#3368B2] text-white' : 'bg-[#131417] text-gray-300 hover:bg-gray-800'}`}
                    >
                      {faq.question}
                      {activeFaq === idx ? <Minus size={18} /> : <Plus size={18} />}
                    </button>
                    {activeFaq === idx && (
                      <div className="px-6 py-5 bg-[#18191D] text-slate-300 text-[15px] sm:text-base leading-relaxed font-normal">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="https://res.cloudinary.com/dccui8s58/image/upload/v1790852909/okobiz/assets/clientsfotter-o_Y4RCBU.jpg" alt="Team hands" className="rounded-xl shadow-2xl w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Talk CTA */}
      <TalkCta />

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes clients-slide-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 50s linear infinite;
        }
        .animate-clients-slide-right {
          animation: clients-slide-right 50s linear infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
