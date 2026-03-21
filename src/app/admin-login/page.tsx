"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowRight, Lock, Loader2, Sparkles } from "lucide-react";
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_LOGIN_EMAIL,
  getAdminSession,
  isValidAdminCredentials,
  setAdminSession,
} from "../lib/adminAuth";

const adminFontClass = "font-[family-name:var(--font-sans)]";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [email, setEmail] = useState(ADMIN_LOGIN_EMAIL);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getAdminSession()) {
      router.replace(ADMIN_DASHBOARD_PATH);
      return;
    }

    setIsReady(true);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidAdminCredentials(email, password)) {
      toast.error("Invalid admin credentials");
      return;
    }

    setIsSubmitting(true);

    window.localStorage.setItem("aec_admin_email", email.trim().toLowerCase());
    setAdminSession(true);
    toast.success("Logged in successfully");
    router.replace(ADMIN_DASHBOARD_PATH);
  };

  if (!isReady) {
    return (
      <main className={`${adminFontClass} min-h-screen bg-[#F4F6FF] text-slate-900`}>
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-5 shadow-[0_25px_80px_rgba(27,77,128,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-[#1B4D80]" />
              Preparing login form...
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${adminFontClass} min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(27,77,128,0.18),_transparent_26%),linear-gradient(180deg,#F4F6FF_0%,#EEF3FF_100%)] text-slate-900`}>
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-[#1B4D80]/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-[#F3C623]/20 blur-3xl" />

        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <motion.section
            initial={{ opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-8 shadow-[0_24px_80px_rgba(27,77,128,0.12)] backdrop-blur-xl sm:p-10"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(27,77,128,0.08),transparent_45%,rgba(255,255,255,0.6))]" />
            <div className="relative max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#1B4D80]">
                <Sparkles className="h-3.5 w-3.5" />
                Admin access
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  AEC competition dashboard, protected for organizers only.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Sign in to review registrations, export teams, and manage acceptance statuses from one premium control surface.
                </p>
              </div>

             
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(27,77,128,0.14)] backdrop-blur-xl sm:p-8"
          >
            <div className="relative">
              <div className="mb-6 inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-[#1B4D80]">
                <Lock className="mr-2 h-3.5 w-3.5" />
                Admin login
              </div>

              <div className="mb-8 space-y-2">
                <h2 className="text-2xl font-semibold text-slate-950">Welcome back</h2>
                
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1B4D80]/30 focus:bg-white"
                    placeholder="aec@vic.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1B4D80]/30 focus:bg-white"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1B4D80] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(27,77,128,0.22)] transition hover:bg-[#163f69] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Open dashboard
                </button>
              </form>

            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
