"use client";

import React, { useState, useEffect } from 'react';

interface TimerProps {
  targetDate?: string;
}

export default function Timer({ targetDate = '2026-04-04T00:00:00' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      setTimeLeft(Math.max(0, target - new Date().getTime()));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!hasMounted) return null; // Prevent hydration mismatch

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const timeBlocks = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Mins', value: minutes },
    { label: 'Secs', value: seconds },
  ];

  if (timeLeft === 0) {
    return (
      <div className="z-20">
        {/* <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#EB8317]">Registration</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#EB8317]"></div>
        <span className="text-[#F4F6FF] text-sm font-bold tracking-widest uppercase">Closed</span> */}
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-7 px-8 py-4 sm:py-5 mt-8 md:rounded-[2rem] rounded-2xl bg-[#1B4D80]/40 border border-[#BAD7E9]/20 backdrop-blur-xl z-20"
      style={{
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(5,25,53,0.4)',
      }}
    >
      <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#BAD7E9] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] text-center">
        Registration<br className="hidden md:block"/> Closed In
      </span>
      
      <div className="hidden md:block w-px h-10 bg-[#BAD7E9]/20"></div>
      <div className="md:hidden w-full h-px bg-[#BAD7E9]/20 mb-2"></div>

      <div className="flex items-center gap-2 sm:gap-4">
        {timeBlocks.map((block, idx) => (
          <React.Fragment key={block.label}>
            <div className="flex flex-col items-center min-w-[3rem] sm:min-w-[4rem]">
              <span 
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-[#F4F6FF] to-[#BAD7E9] bg-clip-text text-transparent transform transition-all tracking-tight leading-none" 
                style={{ fontFamily: 'monospace, sans-serif' }}
              >
                {String(block.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#BAD7E9]/70 mt-1 sm:mt-2 uppercase">
                {block.label}
              </span>
            </div>

            {/* Separator */}
            {idx < 3 && (
              <span className="text-[#BAD7E9] font-medium text-lg sm:text-2xl mb-4 sm:mb-5 opacity-70 transform -translate-y-px">
                :
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
