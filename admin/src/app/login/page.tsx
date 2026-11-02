"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(from);
        router.refresh();
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = () => {
    setEmail("admin@okobiz.com");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-800/80 bg-[#131417]/95">
      {/* Logo & Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-4 border border-white/10 shadow-inner">
          <img
            src="/assets/okobiz-logo-C_Tt48xb.png"
            alt="okobiz"
            className="h-10 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Portal</h1>
        <p className="text-gray-400 text-xs mt-1.5">Manage contents, media assets, and business records</p>
      </div>

      {/* Quick Demo Credentials Badge */}
      <div className="mb-6 p-3.5 rounded-xl bg-[#1C2029] border border-blue-900/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-300">
          <Sparkles size={16} className="text-[#3368B2]" />
          <span>Default: <strong className="text-white">admin@okobiz.com</strong> / <strong className="text-white">admin123</strong></span>
        </div>
        <button
          type="button"
          onClick={fillQuickDemo}
          className="text-[#3368B2] hover:text-blue-400 font-semibold underline text-[11px] ml-2 shrink-0"
        >
          Auto-fill
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@okobiz.com"
              className="w-full bg-[#181A1F] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2] focus:ring-1 focus:ring-[#3368B2] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#181A1F] border border-gray-800 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2] focus:ring-1 focus:ring-[#3368B2] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#3368B2] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 text-sm tracking-wide"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-800/80 text-center">
        <p className="text-gray-500 text-xs flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-[#3368B2]" />
          Secured with JWT and encrypted MongoDB persistence
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3368B2]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0167D6]/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <Suspense fallback={
          <div className="p-8 text-center text-gray-400 text-xs">
            Loading secure portal...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
