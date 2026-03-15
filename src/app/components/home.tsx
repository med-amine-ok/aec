'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import OceanSurface from "./OceanSurface";

export default function First() {
  const sponsors = [
  '/seg.png',
  '/pathos.png',
  '/petro.png',
  '/dev.png',
  '/tta.png',
  '/tala.png',
  '/cmc.png',
  '/caat.png',
  ];

  return (
    <div className="text-white overflow-hidden font-sans">
      {/* Custom Keyframes for Marquee */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 30s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float 10s ease-in-out infinite 2s; }
      `}</style>

      {/* Hero Section */}
      <div id="hero-section" className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>

        {/* 3D Ocean Background */}
        <div className="absolute inset-0 z-0">
          <OceanSurface />
        </div>

        {/* Blueprint grid overlay */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.2)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/90 via-[#0a0f1d]/50 to-[#0a0f1d]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent_70%)]"></div>
        </div>

        {/* ── Hero Content — truly centered in visible area ── */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full h-[100dvh] min-h-[600px] px-4 sm:px-6 md:pt-16 pb-32 md:pb-24">
          <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto gap-6 sm:gap-8">

            {/* Event Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-[#e2e8f0] to-[#38bdf8] drop-shadow-lg leading-[1.1]">
              Engineering<br />Innovation Summit
            </h1>

            {/* Taglines */}
            {/* <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-xs sm:text-sm md:text-xl font-bold tracking-[0.15em] md:tracking-[0.2em] text-white/80">
              <span className="text-[#38bdf8]">INNOVATE.</span>
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#38bdf8]/50"></span>
              <span>ENGINEER.</span>
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#38bdf8]/50"></span>
              <span className="text-[#38bdf8]">INSPIRE.</span>
            </div> */}

            {/* Event Details */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-8 text-xs sm:text-sm md:text-lg text-[#cbd5e1] font-medium bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-xl w-full sm:w-auto">
              {/* Date */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="tracking-wide">March 15-17, 2026</span>
              </div>

              <div className="hidden sm:block w-px self-stretch bg-white/10"></div>

              {/* Location */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="tracking-wide">la bib</span>
              </div>
            </div>

            {/* Register Button */}
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center px-7 sm:px-10 py-3.5 sm:py-5 text-sm sm:text-base md:text-lg font-bold text-white bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] border border-[#38bdf8]/30"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="absolute inset-0 w-full h-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r from-[#38bdf8] to-[#3b82f6]"></span>
              <span className="relative tracking-wider flex items-center gap-2 sm:gap-3 md:text-2xl">
                REGISTER NOW
                <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* ── Social Proof / Infinite Marquee ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 w-full mt-40">
          <div className="py-5  mx-4 sm:mx-8 md:mx-16 rounded-2xl">
            <p className="text-center text-[#94a3b8] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] mb-4">
              Trusted by Industry Leaders
            </p>
            <div className="relative flex overflow-hidden w-full max-w-7xl mx-auto">
             
              {/* Fade edges */}
              {/* <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-[#0a0f1d]/60 to-transparent pointer-events-none rounded-l-2xl"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-[#0a0f1d]/60 to-transparent pointer-events-none rounded-r-2xl"></div> */}

              <div className="animate-marquee py-2 flex items-center">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-8 sm:gap-16 lg:gap-24 px-4 items-center justify-around min-w-full">
                    {sponsors.map((logo, idx) => (
                      <div
                        key={`${i}-${idx}`}
                        className="relative h-6 sm:h-10 w-24 sm:w-32 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 mix-blend-screen hover:mix-blend-normal transition-all duration-500 ease-in-out hover:scale-110 cursor-pointer shrink-0 drop-shadow-md"
                      >
                        <Image
                          src={logo}
                          alt={logo.replace('/', '').replace('.png', '')}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

