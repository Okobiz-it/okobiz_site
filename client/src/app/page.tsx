
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import TalkCta from "@/components/TalkCta";
import { Play, ArrowRight, Monitor, PenTool, BarChart, Plus, Minus } from "lucide-react";
import ClientStepSlider from "@/components/ClientStepSlider";
import { getHeroSlides, getFaqs, HeroSlideItem, FaqItemType } from "@/lib/api";

const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  { title: "Drive Business, Elevate Success", img: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852950/okobiz/assets/Untitled-10-C-7O9vGO.jpg" },
  { title: "Boosting Business Digitally", img: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852952/okobiz/assets/Untitled-11-BtrXcvlB.jpg" },
  { title: "Transforming Ideas into Growth", img: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852954/okobiz/assets/Untitled-12-DD3oUXmC.jpg" },
  { title: "Where Creativity Meets Technology", img: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852955/okobiz/assets/Untitled-13-C9Bpoyra.jpg" },
  { title: "Empowering Your Digital future", img: "https://res.cloudinary.com/dccui8s58/image/upload/v1790852957/okobiz/assets/Untitled-14-FHKbdJRS.jpg" }
];

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

const DEFAULT_FAQS: FaqItemType[] = [
  {
    question: "What services do talent agencies provide?",
    answer: "Talent agencies provide representation, negotiation, career management, and contract guidance for models, actors, creatives, and athletes to secure work and maximize career opportunities."
  },
  {
    question: "How can I get represented by a talent agency?",
    answer: "To get represented, you typically submit a portfolio or showreel, attend open casting calls, or get scouted. It is important to have professional materials."
  },
  {
    question: "What is the process of getting an agent for my child?",
    answer: "The process involves submitting photos, attending meetings, and ensuring the agency specializes in youth talent. Parents must be highly involved."
  },
  {
    question: "What are the common commission rates for talent agencies?",
    answer: "Standard commission rates range between 10% and 20% depending on the industry and the specific union regulations."
  }
];

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(DEFAULT_HERO_SLIDES);
  const [faqs, setFaqs] = useState<FaqItemType[]>(DEFAULT_FAQS);

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

        {/* Tickers */}
        <div className="absolute bottom-0 w-full z-20 flex flex-col">
          <div className="bg-[#FFFF00] text-black py-4 overflow-hidden flex">
            <div className="animate-marquee whitespace-nowrap flex items-center font-bold text-[15px] md:text-[16px]">
              {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                  {TICKER_ITEMS.map((item, idx) => (
                    <span key={idx} className="mx-6 flex items-center">
                      ★ <span className="mx-6 uppercase">{item}</span>
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="bg-black text-[#FFFF00] py-4 overflow-hidden flex border-t border-[#333]">
            <div className="animate-marquee-reverse whitespace-nowrap flex items-center font-bold text-[15px] md:text-[16px]">
              {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                  {TICKER_ITEMS_BLACK.map((item, idx) => (
                    <span key={idx} className="mx-6 flex items-center">
                      ★ <span className="mx-6 uppercase">{item}</span>
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
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center border border-gray-800 p-8 rounded-md bg-[#131417]">
            <span className="text-4xl font-bold text-white mb-2">2018</span>
            <span className="text-gray-400 text-sm font-medium">Journey Started</span>
          </div>
          <div className="flex flex-col items-center border border-gray-800 p-8 rounded-md bg-[#131417]">
            <span className="text-4xl font-bold text-white mb-2">150</span>
            <span className="text-gray-400 text-sm font-medium">Happy Clients</span>
          </div>
          <div className="flex flex-col items-center border border-gray-800 p-8 rounded-md bg-[#131417]">
            <span className="text-4xl font-bold text-white mb-2">20</span>
            <span className="text-gray-400 text-sm font-medium">Team Members</span>
          </div>
          <div className="flex flex-col items-center border border-gray-800 p-8 rounded-md bg-[#131417]">
            <span className="text-4xl font-bold text-white mb-2">6+</span>
            <span className="text-gray-400 text-sm font-medium">Years of Excellence</span>
          </div>
        </div>
      </section>

      {/* 3. Our Clients */}
      <section className="py-16 md:py-24 relative bg-[#131417] bg-cover bg-no-repeat bg-center overflow-hidden" style={{ backgroundImage: "url('https://res.cloudinary.com/dccui8s58/image/upload/v1790853389/okobiz/assets/background-Bw2fnejs.png')" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
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
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Website & App Development', desc: 'We offer professional website and app development services that are suited to your business requirements.', icon: Monitor, link: '/website-app-development-service' },
            { title: 'Creative Solution', desc: 'Our visual and motion design solutions will help to elevate your brand. We bring your ideas to life.', icon: PenTool, link: '/graphics-solution-service' },
            { title: 'Digital Marketing', desc: 'Our digital marketing services will help you increase your internet visibility. We specialize in connecting you with your target audience.', icon: BarChart, link: '/digital-marketing-service' }
          ].map((srv, i) => (
            <div key={i} className="bg-[#18191D] border border-gray-800 p-10 rounded-lg hover:-translate-y-2 transition-transform duration-300 group flex flex-col justify-between h-full">
              <div>
                <srv.icon size={48} className="text-[#3368B2] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4 line-clamp-2">{srv.title}</h3>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm line-clamp-3 overflow-hidden text-ellipsis">{srv.desc}</p>
              </div>
              <Link href={srv.link} className="inline-block bg-[#222327] hover:bg-[#3368B2] text-white px-6 py-2 rounded font-semibold text-sm transition-colors border border-gray-700 hover:border-[#3368B2] self-start">
                READ MORE <span className="text-[#3368B2] group-hover:text-white ml-1">+</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Feature Showcase + Discount Banner */}
      <section className="py-20 bg-[#18191D] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative flex items-center justify-between">
          <div className="bg-white rounded-lg p-10 md:p-12 md:w-1/2 relative z-10 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Website & Apps<br/>Development</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              To provide a consistent user experience, our team of skilled developers guarantees that your website works perfectly across all devices and platforms. Whether it's an online store, an app page, or a business website, we use the newest technology.
            </p>
            <Link href="/services" className="inline-block bg-[#3368B2] text-white px-8 py-3 font-semibold uppercase tracking-wider rounded shadow-lg hover:bg-blue-700 transition">
              Explore Services
            </Link>
          </div>
          <div className="hidden md:flex absolute -right-6 lg:right-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none select-none items-center justify-end">
            <img
              src="/assets/tech-hud-vector.png"
              alt="Tech Vector Graphic"
              className="w-[420px] lg:w-[480px] xl:w-[530px] h-auto object-contain opacity-80"
            />
          </div>
        </div>
      </section>

      {/* Special Discount */}
      <section className="bg-gradient-to-r from-[#0d1829] to-[#18191D] py-16 border-y border-[#3368B2]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#3368B2] rounded flex items-center justify-center">
                <Monitor size={20} className="text-white" />
              </div>
              <h3 className="text-[#3368B2] font-semibold text-lg">Special Discount for your first Project</h3>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Web Design & Development.</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Get your custom website and app development at a special rate. Our expert team designs user-friendly interfaces, responsive layouts, and practical features to enhance digital interactions and maximize your growth.
            </p>
            <Link href="/contact-us" className="inline-flex items-center gap-2 bg-[#3368B2] text-white px-8 py-3 rounded font-bold uppercase tracking-wider hover:bg-blue-700 transition">
              Order Now <ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative flex justify-center">
            <img src="https://res.cloudinary.com/dccui8s58/image/upload/v1790853402/okobiz/assets/discount-banner-_i19yyC6.png" alt="Discount 35%" className="max-w-full h-auto animate-float" />
          </div>
        </div>
      </section>

      {/* 6. Creative Graphics Solution */}
      <section className="py-20 bg-[#131417]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white border-b-2 border-white inline-block pb-2">Creative Graphics Solution</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { t: 'Brand & Logo Identity', d: 'Brand identity encompasses how a brand visually, verbally, and emotionally represents itself...', i: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790853433/okobiz/assets/pattern-000-DD9OVOOk.png' },
              { t: '3D & Motion Design', d: 'We specialize in 3D & Motion Design services to fulfill our clients visual communication needs.', i: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790853433/okobiz/assets/pattern-000-DD9OVOOk.png' },
              { t: 'Static content', d: 'We specialize in Graphic Design services crafted to meet our clients visual communication needs.', i: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790853433/okobiz/assets/pattern-000-DD9OVOOk.png' }
            ].map((f, i) => (
              <div key={i} className="bg-[#18191D] p-8 border border-gray-800 rounded group hover:border-[#3368B2] transition">
                <div className="w-16 h-16 bg-[#222327] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#3368B2] transition-colors">
                  <PenTool className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">{f.t}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { t: 'Motion Graphics', s: 'Branding, Commercials, 2D', img: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790852880/okobiz/assets/motion-1q7Q6TgM.jpg' },
              { t: 'App & UI Motion', s: 'Interactions, Micro-animations', img: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790852902/okobiz/assets/StockFootage-bNm9m1vC.jpg' },
              { t: '3D Animation', s: 'Models, Product Visuals', img: 'https://res.cloudinary.com/dccui8s58/image/upload/v1790853446/okobiz/assets/photoshop-DHSFVnai.jpg' }
            ].map((v, i) => (
              <div key={i} className="relative group overflow-hidden rounded bg-black h-[250px]">
                <img src={v.img} alt={v.t} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4 cursor-pointer transform group-hover:scale-110 transition-transform shadow-lg shadow-green-500/50">
                     <Play size={20} fill="white" className="text-white ml-1" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{v.t}</h3>
                  <p className="text-gray-300 text-sm">{v.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Digital Marketing & FAQ */}
      <section className="py-20 bg-[#18191D]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white border-b-2 border-white inline-block pb-2">Digital Marketing</h2>
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
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-white">{m.t}</h3>
                  <p className="text-gray-400 group-hover:text-white/90 leading-relaxed text-sm">{m.d}</p>
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
                      <div className="px-6 py-5 bg-[#18191D] text-gray-400 text-sm leading-relaxed">
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
