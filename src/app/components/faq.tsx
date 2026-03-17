'use client'
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import "../globals.css";

export default function FAQ() {
  const questions = [
    { question: "How many problems will we be working on?", answer: "Three problem statements will be proposed, and each team will be assigned one to work on." },
    { question: "Does the team need to stay overnight during the competition?", answer: "Yes, it’s a hackathon that requires participants to stay overnight. However, only 2 out of the 4 team members are allowed to leave at night and return in the morning." },
    { question: "Do all team members need to fill out the registration?", answer: "No, only the team leader must register on behalf of the entire team." },
    { question: "Should all team members be from the same field or specialty?", answer: "Not at all. Team versatility is encouraged, and various skills are needed, including flexible prototyping, hands-on work, strong programming knowledge, critical thinking, robotics development, 3D printing, and experimental modeling." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id='FAQ' className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 overflow-hidden z-10 font-sans">

      {/* SVG Circuit Background (Faded into the background) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(230,247,255,0.15)" strokeWidth="1" />
            </pattern>
            <pattern id="blueprint-grid-lg" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="url(#blueprint-grid)" />
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(230,247,255,0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid-lg)" />

          {/* Circuit Lines */}
          <path d="M10%,20% L25%,20% L30%,25% L30%,40%" fill="none" stroke="rgba(230,247,255,0.2)" strokeWidth="1" />
          <circle cx="10%" cy="20%" r="3" fill="rgba(230,247,255,0.3)" />
          <circle cx="30%" cy="40%" r="3" fill="none" stroke="rgba(230,247,255,0.3)" />

          <path d="M90%,30% L80%,30% L75%,25% L65%,25%" fill="none" stroke="rgba(230,247,255,0.2)" strokeWidth="1" />
          <circle cx="90%" cy="30%" r="3" fill="rgba(230,247,255,0.3)" />
          <circle cx="65%" cy="25%" r="3" fill="none" stroke="rgba(230,247,255,0.3)" />

          {/* Architectural structural arches */}
          <path d="M35%,60% C45%,50% 55%,50% 65%,60%" fill="none" stroke="rgba(230,247,255,0.2)" strokeWidth="1" strokeDasharray="10 5" />
          <path d="M40%,60% C45%,55% 55%,55% 60%,60%" fill="none" stroke="rgba(230,247,255,0.2)" strokeWidth="1" />
          <line x1="50%" y1="52%" x2="50%" y2="80%" stroke="rgba(230,247,255,0.2)" strokeWidth="1" strokeDasharray="5 5" />
        </svg>
      </div>

      {/* Simple Transparent Container so background shows through */}
      <div className="relative z-50 w-full flex flex-col items-center gap-14 pointer-events-auto">
        <div className="text-center space-y-3">
          <h1 className="aec text-4xl md:text-5xl lg:text-6xl text-[#e6f7ff] uppercase tracking-wide">
            FAQ
          </h1>
          <p className="text-white/60 text-sm sm:text-base tracking-[0.2em] uppercase font-light">
            Frequently Asked Questions
          </p>
          <div className="w-16 h-[1px] bg-[#e6f7ff]/30 mx-auto mt-6"></div>
        </div>

        <div className="w-[90%] sm:w-[85%] md:w-3/4 lg:w-[70%] max-w-4xl space-y-4">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={index}
                className={`group relative overflow-hidden transition-all duration-500 ease-out border rounded-xl sm:rounded-2xl backdrop-blur-md pointer-events-auto
                  ${isOpen
                    ? 'shadow-[0_12px_38px_rgba(0,191,255,0.15),0_10px_34px_rgba(255,194,0,0.12)] border-white/30 sm:scale-[1.01]'
                    : 'shadow-[0_8px_24px_rgba(0,0,0,0.22)] border-white/10 hover:border-white/25 hover:shadow-[0_12px_30px_rgba(0,0,0,0.32)]'
                  }`}
              >
                {/* Background Image per card */}
                <div 
                  className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center transition-opacity duration-500" 
                  style={{ 
                    backgroundImage: `url('/${index + 1}.webp')`,
                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                  }}
                />

                {/* Algeria identity stripe */}
                <div className="absolute top-0 right-0 left-0 h-[2px] z-[1] bg-gradient-to-r from-[#0f7a3f] via-white to-[#d62828] opacity-80"></div>

                {/* Mediterranean side */}
                <div
                  className="absolute inset-0  group-hover:from-[#0a2040]/90 group-hover:via-[#123267]/85 group-hover:to-[#1a4da3]/80 transition-colors duration-700 pointer-events-none"
                  style={{ clipPath: 'polygon(0 0, 52% 0, 38% 100%, 0 100%)' }}
                />

                {/* Sahara side */}
                <div
                  className="absolute inset-0  group-hover:from-[#392105]/90 group-hover:via-[#70420a]/85 group-hover:to-[#a96b0f]/80 transition-colors duration-700 pointer-events-none"
                  style={{ clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 38% 100%)' }}
                />

                {/* Blueprint grid + engineering texture */}
                <div className="absolute inset-0 opacity-35 pointer-events-none z-[1]">
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <pattern id={`card-grid-${index}`} width="26" height="26" patternUnits="userSpaceOnUse">
                        <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(230,247,255,0.12)" strokeWidth="0.7" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#card-grid-${index})`} />
                    <path d="M 12% 82% C 28% 70%, 52% 70%, 68% 84%" fill="none" stroke="rgba(255,255,255,0.17)" strokeWidth="1" strokeDasharray="8 5" />
                    <path d="M 70% 30% L 78% 30% L 82% 38%" fill="none" stroke="rgba(230,247,255,0.22)" strokeWidth="1" />
                    <circle cx="82%" cy="38%" r="2" fill="rgba(230,247,255,0.35)" />
                  </svg>
                </div>

                {/* Diagonal split accent */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-[2]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`split-glow-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00bfff" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#FFC200" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  <line x1="52%" y1="0" x2="38%" y2="100%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <line x1="52%" y1="0" x2="38%" y2="100%" stroke={`url(#split-glow-${index})`} strokeWidth="2" strokeDasharray="20 80" className="opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                  <path d="M 45% 50% L 42% 50% L 40% 45%" fill="none" stroke="rgba(0,191,255,0.4)" strokeWidth="1" className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
                  <circle cx="40%" cy="45%" r="2" fill="#00bfff" className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
                  <path d="M 48% 65% L 51% 65% L 53% 70%" fill="none" stroke="rgba(255,194,0,0.4)" strokeWidth="1" className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200" />
                  <circle cx="53%" cy="70%" r="2" fill="#FFC200" className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200" />
                </svg>

                <button
                  type="button"
                  className="w-full text-left px-2 py-4 sm:px-3 sm:py-5 md:px-4 md:py-6 flex items-center justify-between cursor-pointer z-10 relative gap-4 min-h-[90px] md:min-h-[110px]"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-label={`Toggle FAQ question ${index + 1}`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="hidden sm:flex relative items-center justify-center w-3.5 h-3.5 mr-0.5 flex-shrink-0">
                      <div className={`absolute w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isOpen ? 'bg-amber-400 shadow-[0_0_8px_#FFC200]' : 'bg-cyan-400 group-hover:bg-amber-400 shadow-[0_0_8px_#00bfff]'}`}></div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/55 tech-accent mb-0.5 sm:mb-1">
                        Q{String(index + 1).padStart(2, '0')} • AEC 
                      </p>
                      <span className={`text-[25px] text-xs font-semibold leading-snug sm:leading-normal tracking-[0.01em] transition-colors duration-300 pointer-events-none select-none pr-1 sm:pr-2 drop-shadow-md ${isOpen ? 'text-white' : 'text-[#e6f7ff]/95'}`}>
                        {item.question}
                      </span>
                    </div>
                  </div>

                  <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-500 pointer-events-none border ${isOpen ? 'bg-amber-400/10 border-amber-400/30 text-amber-400 shadow-[0_0_12px_rgba(255,194,0,0.15)]' : 'bg-white/5 border-white/10 text-white/50 group-hover:border-cyan-400/30 group-hover:text-cyan-400 group-hover:bg-cyan-400/10'}`}>
                    <ChevronDown
                      className={`transition-transform duration-500 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.6}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 pt-0.5 animate-in fade-in slide-in-from-top-2 duration-500 z-10 relative">
                    <div className="pl-0 sm:pl-6 border-t border-white/10 pt-3 sm:pt-4">
                      <p className="text-white/85 text-lg sm:text-xl md:text-2xl leading-relaxed font-light tracking-[0.01em] drop-shadow max-w-[92ch]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
