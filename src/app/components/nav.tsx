"use client";
import "../globals.css";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 font-[Raleway] transition-all duration-300">
      <div 
        className={`mx-auto flex max-w-7xl items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isScrolled 
            ? "mt-4 w-[95%] sm:w-[90%] rounded-full border border-white/15 bg-white/5 px-6 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl" 
            : "mt-6 w-full px-6 sm:px-12 py-4 bg-transparent border-transparent"
        }`}
      >
        {/* Logo */}
         <Link href="#home" className="flex items-center">
            <div className="relative group/logo">
              <motion.div
                className="absolute inset-0 bg-white/20 blur-3xl rounded-full opacity-0 group-hover/logo:opacity-50 transition-opacity duration-700"
                layoutId="logoGlow"
              />
            <Image
  src="/aecWH.svg"
  alt="AEC Logo"
  width={450}
  height={120}
  className="h-12 sm:h-14 w-auto object-contain scale-[1.6] sm:scale-[2] origin-left transition-all duration-700 ease-out group-hover/logo:scale-[1.7] sm:group-hover/logo:scale-[2.1] group-hover/logo:brightness-110 drop-shadow-[0_2px_4px_rgba(255,255,255,0.15)] drop-shadow-[0_8px_20px_rgba(255,255,255,0.25)] drop-shadow-[0_20px_60px_rgba(255,255,255,0.12)]"
  priority
/>
            </div>
          </Link>

        {/* Home Button */}
        <div>
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={2.5} />
            <span className="mt-[1px]">HOME</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
