"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import OceanSurface from "./OceanSurface";
import Timer from "./timer";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center text-white overflow-hidden font-sans">
   
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
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-3xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight bg-gradient-to-br from-[#F4F6FF] to-[#BAD7E9] bg-clip-text text-transparent drop-shadow-[0_4px_2px_rgba(27,77,128,0.6)] text-center w-[95vw] md:w-full max-w-[140%] mt-10"
        >
          From North to South, East to West,
          <br />
          <span className="block mt-1">one winning team</span>
        </motion.h1>

        {/* Outlined background text */}
        <div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="hidden sm:flex absolute left-0 top-1/2 w-full items-center justify-center -translate-y-1/2 z-0 pointer-events-none select-none mb-8"
          >
            <span
              className="text-[14vw] sm:text-[8vw] md:text-[6vw] font-extrabold tracking-tight"
              style={{
                WebkitTextStroke: "2px #10375c",
                color: "transparent",
                opacity: 0.13,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                display: "block",
              }}
            >
              AEC 2026
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="flex sm:hidden w-full left-0 items-center justify-center"
          >
            <span
              className="text-[16vw] font-extrabold tracking-tight"
              style={{
                WebkitTextStroke: "2px #10375c",
                color: "transparent",
                opacity: 0.13,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                display: "block",
              }}
            >
              AEC 2026
            </span>
          </motion.div>
        </div>

        {/* Glass Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-0 sm:mt-8 backdrop-blur-xl bg-[#1B4D80]/20 border border-[#BAD7E9]/20 rounded-2xl px-3 py-3 sm:py-4 sm:px-5 flex flex-row items-center gap-6 shadow-[0_10px_40px_rgba(16,55,92,0.5)]"
        >
          <div className="text-center sm:text-left">
            <p className="text-sm text-[#BAD7E9]/70">Date</p>
            <p className="font-semibold text-[#F4F6FF]">Stay Tuned!</p>
          </div>

          <div className=" sm:block w-px h-8 bg-[#BAD7E9]/20"></div>

          <div className="text-center sm:text-left">
            <p className="text-sm text-[#BAD7E9]/70">Location</p>
            <p className="font-semibold text-[#F4F6FF]">
              Nationwide • 4 Wilaya
            </p>
          </div>
        </motion.div>

        {/* Dynamic Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="w-full flex justify-center"
        >
          <Timer targetDate="2026-04-04T00:00:00" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
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
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 text-[#BAD7E9] text-xl"
      >
        ↓
      </motion.div>
    </section>
  );
}