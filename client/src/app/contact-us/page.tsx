"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Clock, MapPin, Send } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import { sendContactMessage } from "@/lib/api";

export default function ContactUsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Website Development",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await sendContactMessage(formData);
      router.push("/thankyou");
    } catch (err) {
      router.push("/thankyou");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black text-white">
      <PageBanner title="Contact Us" subtitle="Let's build something exceptional together" />

      <section
        style={{ backgroundImage: "url('/assets/contactBG-DK4LBNfM.webp')" }}
        className="py-20 bg-cover bg-left-bottom"
      >
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span
              className="font-bold px-5 py-2 mb-3 inline-block text-[#0167D6] rounded-full text-xs uppercase tracking-wider"
              style={{ background: "rgba(1, 103, 214, 0.15)" }}
            >
              - Our Office -
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-2 mb-4">
              Let&apos;s Get In Touch
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              We&apos;re here to answer questions, map technical roadmaps, and discuss your next breakthrough digital project.
            </p>
          </div>

          <div className="bg-[#141416] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            {/* Form Section */}
            <div className="w-full lg:w-2/3 p-8 sm:p-12">
              <h3 className="text-2xl font-bold text-white mb-8">
                Write to Us Anytime
              </h3>

              {feedback && (
                <div className="mb-6 p-4 rounded-lg bg-green-900/40 border border-green-700 text-green-300 text-sm">
                  {feedback}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1C] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Enter E-Mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1C] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 1..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1C] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1A1A1C] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#3368B2]"
                    >
                      <option value="Website Development">Website Development</option>
                      <option value="App Development">App Development</option>
                      <option value="Graphics Design">Graphics Design</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Write Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your project scope, timeline, and goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1A1A1C] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-[#3368B2] hover:bg-[#0167D6] text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            </div>

            {/* Contact Information Sidebar */}
            <div className="w-full lg:w-1/3 bg-[#3368B2] text-white p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  Don&apos;t Forget to Contact Us
                </h3>
                <p className="text-sm text-blue-100 mb-8 leading-relaxed">
                  Reach out directly by phone, email, or visit our headquarters in Dhaka.
                </p>

                <div className="space-y-6 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">Call Us</p>
                      <a href="tel:+8801973590937" className="font-bold hover:underline">
                        01973-590937
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">Send E-Mail</p>
                      <a href="mailto:info@okobiz.com" className="font-bold hover:underline">
                        info@okobiz.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">Office Hours</p>
                      <p className="font-bold">10.00 AM to 6.00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">Headquarters</p>
                      <p className="font-bold">Mirpur, Dhaka 1216, Bangladesh</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-blue-400/30 mt-8">
                <p className="text-xs text-blue-100">
                  Quick response guaranteed within 24 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TalkCta />
    </div>
  );
}
