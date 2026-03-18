"use client";

import React from "react";
import Link from "next/link";
import OceanSurface from "./OceanSurface";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center text-white overflow-hidden font-sans">
      {/* 🌊 Ocean Background */}
      <div className="absolute inset-0 z-0">
        <OceanSurface />
      </div>

      {/* Subtle Grid */}
      {/* <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(186,215,233,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(186,215,233,0.2)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div> */}

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-6 flex flex-col items-center">
        {/* Title - always centered */}
        <h1 className="text-3xl sm:text-3xl md:text-5xl font-extrabold leading-tight tracking-tight bg-gradient-to-br from-[#F4F6FF] to-[#BAD7E9] bg-clip-text text-transparent animate-fadeUp delay-100 drop-shadow-[0_4px_20px_rgba(27,77,128,0.6)] text-center mb-0">
          From North to South, <br />East to West • 48hours, one winning team
        </h1>

        {/* Outlined background text - behind title and card */}
        {/* Outlined background text: absolute behind content on larger screens, static below card on phones */}
        <div>
          <div className="hidden sm:flex absolute left-0 top-1/2 w-full items-center justify-center -translate-y-1/2 z-0 pointer-events-none select-none">
            <span
              className="text-[14vw] sm:text-[8vw] md:text-[6vw] font-extrabold tracking-tight"
              style={{
                WebkitTextStroke: '2px #BAD7E9',
                color: 'transparent',
                opacity: 0.13,
                lineHeight: 1,
                letterSpacing: '-0.05em',
                display: 'block',
              }}
            >
              AEC 2026
            </span>
          </div>
          <div className="flex sm:hidden w-full left-0 items-center justify-center">
            <span
              className="text-[16vw] font-extrabold tracking-tight"
              style={{
                WebkitTextStroke: '2px #BAD7E9',
                color: 'transparent',
                opacity: 0.13,
                lineHeight: 1,
                letterSpacing: '-0.05em',
                display: 'block',
              }}
            >
              AEC 2026
            </span>
          </div>
        </div>

        {/* Glass Card - always below outlined text */}
        <div className="mt-0 sm:mt-8 backdrop-blur-xl bg-[#1B4D80]/20 border border-[#BAD7E9]/20 rounded-2xl px-3 py-3 sm:py-4 sm:px-5 flex flex-row items-center gap-6 animate-fadeUp delay-300 shadow-[0_10px_40px_rgba(16,55,92,0.5)]">
          <div className="text-center sm:text-left">
            <p className="text-sm text-[#BAD7E9]/70">Date</p>
            <p className="font-semibold text-[#F4F6FF]">April 16–18, 2026</p>
          </div>

          <div className=" sm:block w-px h-8 bg-[#BAD7E9]/20"></div>

          <div className="text-center sm:text-left">
            <p className="text-sm text-[#BAD7E9]/70">Location</p>
            <p className="font-semibold text-[#F4F6FF]">
              Nationwide • 4 Cities
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/register"
          className="
            mt-10 inline-flex items-center gap-2 px-8 py-3 rounded-full
            bg-[#10375C] text-[#F4F6FF] font-semibold text-lg
            shadow-[0_0_20px_rgba(27,77,128,0.6)]
            hover:bg-[#1B4D80]
            hover:shadow-[0_0_40px_rgba(27,77,128,0.9)]
            hover:scale-105
            transition-all duration-300
          "
        >
          Register Now →
        </Link>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 text-[#BAD7E9] animate-bounce text-xl">
        ↓
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeUp {
          animation: fadeUp 1s ease forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </section>
  );
}