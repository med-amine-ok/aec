'use client'
import "../globals.css";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Regclose() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden font-sans" style={{ background: '#0a192f' }}>
      
      {/* Background radial gradient for depth */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, #1B4D80 0%, #10375C 50%, #0a192f 100%)'
        }}
      />

      {/* Subtle decorative grid pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="reg-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#BAD7E9" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reg-grid)" />
        </svg>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full bg-[#BAD7E9]/10 blur-[130px] pointer-events-none animate-pulse duration-[4000ms]"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-[#EB8317]/10 blur-[120px] pointer-events-none"></div>

    

      {/* Decorative PC element */}
      <div className="absolute bottom-4 lg:bottom-auto left-1/2 lg:left-auto -translate-x-1/2 lg:translate-x-0 lg:right-[5%] lg:top-[15%] z-30 animate-float" style={{ animation: 'float 6s ease-in-out infinite' }}>
        <img
          src="/pc1.png"
          alt="PC Decor"
          className="w-[160px] sm:w-[220px] lg:w-[300px] xl:w-[450px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-90"
        />
      </div>

      {/* Central Glassmorphism Card */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 w-full max-w-2xl mx-4 sm:mx-6 md:mx-auto mt-[-5vh]"
      >
        
        {/* Animated decorative border container */}
        <div className="relative p-[1px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(5,15,30,0.6)]">
          {/* Animated gradient spinning border */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#BAD7E9]/30 via-[#1B4D80]/10 to-[#EB8317]/30"></div>
          
          <div className="relative z-10 rounded-[23px] backdrop-blur-2xl bg-[#10375C]/70 border border-white/10 p-8 sm:p-12 flex flex-col items-center text-center">
            
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B4D80] to-[#10375C] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(27,77,128,0.8)] border border-[#BAD7E9]/20">
              <Lock className="w-8 h-8 text-[#BAD7E9]" strokeWidth={1.5} />
            </div>

            <span className="inline-block px-4 py-1.5 rounded-full bg-[#EB8317]/10 border border-[#EB8317]/20 text-[#EB8317] text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(235,131,23,0.15)]">
              Registration
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 uppercase leading-tight" style={{
              background: 'linear-gradient(135deg, #F4F6FF 0%, #BAD7E9 50%, #1B4D80 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 10px 30px rgba(186, 215, 233, 0.1)'
            }}>
              Doors Are <br/> Closed
            </h1>

            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-[#EB8317] to-transparent my-6 rounded-full"></div>

            <p className="text-xl sm:text-2xl font-medium text-[#BAD7E9] tracking-wide mb-10">
              Stay Tuned For Updates!
            </p>

            <Link 
              href="/"
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#1B4D80] text-[#F4F6FF] font-semibold text-sm sm:text-base transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(27,77,128,0.5)] hover:shadow-[0_15px_35px_rgba(27,77,128,0.7)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#1B4D80] to-[#10375C] z-0 transition-opacity duration-300 opacity-100 group-hover:opacity-0"></div>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#EB8317] to-[#F3C623] z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
              
              <ArrowLeft className="w-4 h-4 z-10 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="z-10 uppercase tracking-wider">Back to Home</span>
            </Link>
          </div>
        </div>

       
      
      </motion.div>

      {/* Animation definition */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
      `}</style>

    </div>
  );
}
