'use client'
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import "../globals.css";

export default function FAQ() {
  const questions = [
    { question: "How many problems will we be working on?", answer: "Three problem statements will be proposed, and each team will be assigned one to work on." },
    { question: "Does the team need to stay overnight during the competition?", answer: "Yes, it's a hackathon that requires participants to stay overnight. However, only 2 out of the 4 team members are allowed to leave at night and return in the morning." },
    { question: "Do all team members need to fill out the registration?", answer: "No, only the team leader must register on behalf of the entire team." },
    { question: "Should all team members be from the same field or specialty?", answer: "Not at all. Team versatility is encouraged, and various skills are needed, including flexible prototyping, hands-on work, strong programming knowledge, critical thinking, robotics development, 3D printing, and experimental modeling." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id='FAQ' className="relative w-full flex flex-col items-center justify-center py-20 md:py-24 px-4 overflow-hidden z-10 font-sans"
      style={{ background: '#F4F6FF' }}
    >

      {/* Subtle decorative grid pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="faq-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1B4D80" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faq-grid)" />
        </svg>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-20 right-10 w-[400px] h-[400px] rounded-full bg-[#BAD7E9]/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full bg-[#EB8317]/10 blur-[100px] pointer-events-none"></div>

      {/* Content container */}
      <div className="relative z-50 w-full flex flex-col items-center gap-12 pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.8 }}
          className="text-center space-y-3"
        >
          <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-[#EB8317]">
            Got Questions?
          </span>
          <h1 className="aec text-4xl md:text-5xl lg:text-6xl text-[#1B4D80] uppercase tracking-wide">
            FAQ
          </h1>
          <p className="text-[#10375C]/50 text-sm sm:text-base tracking-[0.15em] uppercase font-medium">
            Frequently Asked Questions
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[#1B4D80] via-[#EB8317] to-[#1B4D80] mx-auto mt-4 rounded-full"></div>
        </motion.div>

        <div className="w-[90%] sm:w-[85%] md:w-3/4 lg:w-[70%] max-w-4xl space-y-4">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden transition-all duration-500 ease-out rounded-xl sm:rounded-2xl backdrop-blur-md pointer-events-auto
                  ${isOpen
                    ? 'shadow-[0_12px_38px_rgba(27,77,128,0.2),0_10px_34px_rgba(235,131,23,0.1)] sm:scale-[1.01]'
                    : 'shadow-[0_8px_24px_rgba(27,77,128,0.12)] hover:shadow-[0_12px_30px_rgba(27,77,128,0.18)]'
                  }`}
                style={{
                  background: 'rgba(16,55,92,0.92)',
                  border: isOpen ? '1px solid rgba(235,131,23,0.3)' : '1px solid rgba(27,77,128,0.2)',
                }}
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
                    {/* Question number badge */}
                    <div
                      className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold flex-shrink-0 transition-all duration-500"
                      style={{
                        background: isOpen
                          ? 'linear-gradient(135deg, #EB8317, #F3C623)'
                          : 'rgba(186,215,233,0.12)',
                        color: isOpen ? '#10375C' : '#BAD7E9',
                        boxShadow: isOpen
                          ? '0 4px 16px rgba(235,131,23,0.3)'
                          : '0 2px 8px rgba(0,0,0,0.2)',
                        border: isOpen ? 'none' : '1px solid rgba(186,215,233,0.18)',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
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

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 pt-0.5 z-10 relative">
                        <div className="pl-0 sm:pl-6 border-t border-white/10 pt-3 sm:pt-4">
                          <p className="text-white/85 text-lg sm:text-xl md:text-2xl leading-relaxed font-light tracking-[0.01em] drop-shadow max-w-[92ch]">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
