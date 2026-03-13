"use client";
import "../globals.css";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

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
    <header className="fixed inset-x-0 top-0 z-50 font-gilroy transition-all duration-300">
      <div 
        className={`mx-auto flex max-w-7xl items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isScrolled 
            ? "mt-4 w-[95%] sm:w-[90%] rounded-full border border-white/15 bg-white/5 px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl" 
            : "mt-6 w-full px-6 sm:px-12 py-4 bg-transparent border-transparent"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
          aria-label="Go to home"
        >
          <Image 
            src="/aec.png" 
            alt="AEC Logo" 
            width={140} 
            height={56}
            className="h-9 sm:h-11 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] transition-transform duration-500 hover:scale-[1.04]"
            priority
          />
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
