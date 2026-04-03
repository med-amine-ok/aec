'use client';

import { useState, useEffect } from 'react';

export default function GlobalSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  // Prevent scrolling while splash screen is active
  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSplash]);

  const handleFinish = () => {
    setIsFading(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 1000); // Wait 1 second for fade animation to complete
  };

  if (!showSplash) return null;

  return (
    <div 
      suppressHydrationWarning
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#050B14] overflow-hidden transition-opacity duration-1000 ease-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
{/*       
      <video 
        autoPlay 
        muted 
        playsInline 
        onEnded={handleFinish}
        className="hidden md:block w-full h-full object-cover"
      >
        <source src="/animh.mp4" type="video/mp4" />
      </video>

     
      <video 
        autoPlay 
        muted 
        playsInline 
        onEnded={handleFinish}
        className="block md:hidden w-full h-full object-cover"
      >
        <source src="/animv.mp4" type="video/mp4" />
      </video>
      <button 
        onClick={handleFinish} 
        disabled={isFading}
        className={`absolute top-6 right-6 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg backdrop-blur-sm transition-all z-50 text-sm font-medium tracking-wider border border-white/10 hover:border-white/30 ${isFading ? 'opacity-0 cursor-default' : 'opacity-100'}`}
      >
        Skip
      </button> */}
    </div>
  );
}
