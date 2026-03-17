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
        <div className="absolute inset-0 z-0 pointer-events-none">
          <OceanSurface />
        </div>

        {/* Blueprint grid overlay */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.2)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/90 via-[#0a0f1d]/50 to-[#0a0f1d]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent_70%)]"></div>
        </div>

        {/* ── Hero Content — truly centered in visible area ── */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full min-h-[calc(100dvh-170px)] px-4 sm:px-6 md:pt-16 pb-8 md:pb-10">
          <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto gap-6 sm:gap-8">

            {/* Event Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mt-10 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-[#e2e8f0] to-[#38bdf8] drop-shadow-lg leading-[1.1]">
              Engineering<br />Innovation Summit
            </h1>

            {/* Event Details */}
            
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 md:gap-12 bg-gradient-to-br from-[#172554]/80 via-[#0f172a]/70 to-[#38bdf8]/10 border border-[#38bdf8]/20 px-6 sm:px-10 py-6 sm:py-8 rounded-3xl shadow-2xl w-full sm:w-auto">
                {/* Date */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-[#38bdf8]/30 via-[#60a5fa]/20 to-[#e0f2fe]/10 border border-[#38bdf8]/30 shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="#38bdf8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base md:text-lg font-semibold text-[#e0f2fe] tracking-wide">March 15-17, 2026</span>
                    <span className="text-[10px] text-[#60a5fa] font-medium">Save the date</span>
                  </div>
                </div>

                <div className="hidden sm:block w-px self-stretch bg-gradient-to-b from-[#38bdf8]/30 to-[#e0f2fe]/10"></div>

                {/* Location */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-[#38bdf8]/30 via-[#60a5fa]/20 to-[#e0f2fe]/10 border border-[#38bdf8]/30 shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="#38bdf8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base md:text-lg font-semibold text-[#e0f2fe] tracking-wide">la bib</span>
                    <span className="text-[10px] text-[#60a5fa] font-medium">Venue</span>
                  </div>
                </div>
              </div>
            

            {/* Register Button */}
            <Link
              href="/register"
              className="group mb-8 relative inline-flex items-center justify-center px-5 sm:px-8 py-2 sm:py-3 text-sm md:text-base font-bold text-[#172554] bg-gradient-to-r from-[#e0f2fe] via-[#38bdf8]/80 to-[#60a5fa]/80 rounded-full border border-[#38bdf8]/30 shadow-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/20"
            >
              <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#38bdf8]/40 to-transparent"></span>
              <span className="relative tracking-wider flex items-center gap-2 md:text-lg">
                <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="#38bdf8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                REGISTER NOW
                <svg className="w-4 h-4 text-[#38bdf8]" fill="none" stroke="#38bdf8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#38bdf8" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* ── Social Proof / Infinite Marquee ── */}
        <div className="relative z-20 w-full pb-4 sm:pb-6">
          <div
            className="mx-3 sm:mx-6 md:mx-12 rounded-2xl border backdrop-blur-md overflow-hidden shadow-[0_14px_48px_rgba(5,25,53,0.35)]"
            style={{
              backgroundColor: '#05091400',
              borderColor: 'rgba(230, 247, 255, 0.22)',
              backgroundImage:
                'linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 45%, rgba(255,216,156,0.18) 100%)',
            }}
          >
            {/* <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.35), transparent 60%)' }} /> */}

            <div className="relative py-4 sm:py-5">
              <p className="text-center text-[#e6f7ff] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] mb-3 sm:mb-4">
                Sponsored by
              </p>

              <div className="relative flex overflow-hidden w-full max-w-7xl mx-auto">
                {/* Fade edges */}
                {/* <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 md:w-28 z-10 bg-gradient-to-r from-[#050914] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 md:w-28 z-10 bg-gradient-to-l from-[#050914] to-transparent pointer-events-none" /> */}

                <div className="animate-marquee py-1 sm:py-2 flex items-center">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-2 sm:gap-12 lg:gap-16 px-1 sm:px-4 items-center justify-around min-w-full">
                      {sponsors.map((logo, idx) => (
                        <div
                          key={`${i}-${idx}`}
                          className="relative h-9 sm:h-12 md:h-14 w-24 sm:w-32 md:w-40 cursor-pointer shrink-0 group"
                        >
                          <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                          <Image
                            src={logo}
                            alt={logo.replace('/', '').replace('.png', '')}
                            fill
                            className="object-contain transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:drop-shadow-[0_0_18px_rgba(56,189,248,0.55)]"
                            sizes="(max-width: 768px) 96px, (max-width: 1200px) 128px, 160px"
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
    </div>
  );
}

