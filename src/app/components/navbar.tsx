"use client";
import "../globals.css";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Trophy, Handshake, MessageCircleQuestion, Users, Menu, MoonStar, Sun, X } from "lucide-react";

function hexToRgb(hex: string) {
  const sanitized = hex.replace("#", "");
  const full = sanitized.length === 3
    ? sanitized.split("").map((ch) => ch + ch).join("")
    : sanitized;
  const num = Number.parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function mixHex(a: string, b: string, t: number) {
  const c1 = hexToRgb(a);
  const c2 = hexToRgb(b);
  const v = Math.max(0, Math.min(1, t));
  const r = Math.round(c1.r + (c2.r - c1.r) * v);
  const g = Math.round(c1.g + (c2.g - c1.g) * v);
  const bVal = Math.round(c1.b + (c2.b - c1.b) * v);
  return `rgb(${r}, ${g}, ${bVal})`;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [skyProgress, setSkyProgress] = useState(0);
  const [isNight, setIsNight] = useState(false);

  const navItems = useMemo(
    () => [
      {
        name: "Home",
        href: "#home",
        icon: <Home className="h-4 w-4" aria-hidden="true" />,
      },
      {
        name: "AEC",
        href: "#aec-experience",
        icon: <Trophy className="h-4 w-4" aria-hidden="true" />,
      },
      {
        name: "Sponsors",
        href: "#sponsors",
        icon: <Handshake className="h-4 w-4" aria-hidden="true" />,
      },
      {
        name: "FAQ",
        href: "#FAQ",
        icon: <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />,
      },
      {
        name: "About Us",
        href: "#about-us",
        icon: <Users className="h-4 w-4" aria-hidden="true" />,
      },
    ],
    [],
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Algeria time is UTC+1 (CET)
      const offsetMs = now.getTimezoneOffset() * 60000;
      const utc = now.getTime() + offsetMs;
      const algeriaDate = new Date(utc + (3600000 * 1));
      
      const hours = algeriaDate.getHours();
      const minutes = algeriaDate.getMinutes();
      const timeInHours = hours + minutes / 60;

      let progress = 0;
      if (timeInHours >= 7 && timeInHours <= 17) {
        progress = 0; // Full day
      } else if (timeInHours >= 19 || timeInHours <= 5) {
        progress = 1; // Full night
      } else if (timeInHours > 5 && timeInHours < 7) {
        // Sunrise (5:00 to 7:00): progress interpolates from 1 to 0
        progress = 1 - ((timeInHours - 5) / 2);
      } else if (timeInHours > 17 && timeInHours < 19) {
        // Sunset (17:00 to 19:00): progress interpolates from 0 to 1
        progress = (timeInHours - 17) / 2;
      }
      
      setSkyProgress(progress);
      setIsNight(progress > 0.5);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateScrollData = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      setScrollProgress(progress);

      const sectionIds = navItems.map((item) => item.href.slice(1));
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));

      let current = "#home";
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.35) {
          current = `#${section.id}`;
        }
      }

      setActiveSection(current);
    };

    updateScrollData();
    window.addEventListener("scroll", updateScrollData, { passive: true });
    window.addEventListener("resize", updateScrollData);
    return () => {
      window.removeEventListener("scroll", updateScrollData);
      window.removeEventListener("resize", updateScrollData);
    };
  }, [navItems]);

  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => item.href === activeSection),
  );

  const itemWidth = 100 / navItems.length;
  // Journey tracker under navbar
  // max translation is (navItems.length - 1) * 100% of its own width
  const journeyTravel = scrollProgress * (navItems.length - 1) * 100;

  // Sea to Sahara horizontal blending mapping properly with Morning to Night vertical state
  // Left: Sea. Right: Sahara.
  
  // Morning: deeply vibrant Mediterranean to golden Sahara
  const seaMorning = "#025a97"; 
  const coastMorning = "#0086b3";
  const duneMorning = "#dca15c"; 
  const saharaMorning = "#e29c36";

  // Night: deep dark starry night colors
  const seaNight = "#050914"; 
  const coastNight = "#0b1832";
  const duneNight = "#2c1d0f"; 
  const saharaNight = "#1a0f02";

  const seaTone = mixHex(seaMorning, seaNight, skyProgress);
  const coastTone = mixHex(coastMorning, coastNight, skyProgress);
  const duneTone = mixHex(duneMorning, duneNight, skyProgress);
  const saharaTone = mixHex(saharaMorning, saharaNight, skyProgress);

  const highlightStart = mixHex("#4db8ff", "#186abf", skyProgress); // Sea side
  const highlightEnd = mixHex("#ffd073", "#cc7c2f", skyProgress); // Sahara side

  const shellBackground = "#050914";
  const shellBorder = `rgba(230, 247, 255, ${isNight ? 0.12 : 0.22})`;
  const overlayShine = `linear-gradient(120deg, rgba(255,255,255,${isNight ? 0.05 : 0.15}) 0%, rgba(255,255,255,0) 45%, rgba(255,216,156,${isNight ? 0.08 : 0.18}) 100%)`;

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 font-[Raleway]"
    >
      <div
        className="relative  mx-3 mt-3 overflow-hidden rounded-2xl border shadow-[0_14px_48px_rgba(5,25,53,0.35)] backdrop-blur-md sm:mx-6 transition-colors duration-700"
        style={{
          backgroundImage: shellBackground,
          borderColor: shellBorder,
        }}
      >
        {/* Shine Overlay Layer */}
        <div className="absolute  inset-0 pointer-events-none" style={{ backgroundImage: overlayShine }} />

        {/* Animated Wave to Sand Dune SVG Border */}
        <div className="pointer-events-none  absolute bottom-0 left-0 right-0 h-8 w-full overflow-hidden mix-blend-overlay">
          <svg
            className="absolute bottom-0 left-0 h-full w-[120%]"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
            aria-hidden="true"
          >
            <path fill={isNight ? "rgba(255,255,255,0.15)" : "rgba(255, 255, 255, 0.15)"} className="transition-all duration-700">
              <animate
                attributeName="d"
                dur="5s"
                repeatCount="indefinite"
                values="
                  M0,80 Q75,45 150,80 T300,80 T450,80 T600,75 Q800,45 1000,60 T1200,50 L1200,120 L0,120 Z;
                  M0,70 Q75,65 150,70 T300,70 T450,70 T600,85 Q800,55 1000,45 T1200,65 L1200,120 L0,120 Z;
                  M0,80 Q75,45 150,80 T300,80 T450,80 T600,75 Q800,45 1000,60 T1200,50 L1200,120 L0,120 Z
                "
              />
            </path>
            <path fill={isNight ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.18)"} className="transition-all duration-700">
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values="
                  M0,90 Q75,55 150,90 T300,90 T450,90 T600,85 Q800,40 1000,70 T1200,55 L1200,120 L0,120 Z;
                  M0,80 Q75,70 150,80 T300,80 T450,80 T600,90 Q800,50 1000,60 T1200,70 L1200,120 L0,120 Z;
                  M0,90 Q75,55 150,90 T300,90 T450,90 T600,85 Q800,40 1000,70 T1200,55 L1200,120 L0,120 Z
                "
              />
            </path>
          </svg>
        </div>

        <div className="relative flex items-center justify-between px-3 py-2 lg:px-8">
          <Link
            href="#home"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe0a3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c2f56]"
            aria-label="Go to home"
          >
            <Image 
              src="/AEC_NEW-02.png" 
              alt="AEC Logo" 
              width={220} 
              height={80}
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.35)] transition-transform duration-300 hover:scale-[1.06] filter brightness-0 invert"
              priority
            />
          </Link>

          <nav
            className="hidden  lg:block relative w-[56%] max-w-2xl"
            aria-label="Main navigation"
          >
             <div
              className="relative rounded-full border px-2 py-1 transition-colors duration-700"
              style={{
                borderColor: isNight ? "rgba(222, 234, 255, 0.15)" : "rgba(230, 247, 255, 0.25)",
                backgroundColor: isNight
                  ? "rgba(7, 18, 45, 0.4)"
                  : "rgba(255, 255, 255, 0.12)",
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
                }}
              >
                {navItems.map((item, index) => {
                  const isActive = activeSection === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group relative flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe0a3] ${
                        isActive
                          ? isNight
                            ? "text-[#f1edff]"
                            : "text-[#f1edff]"
                          : isNight
                            ? "text-[#a9b6d8] hover:text-[#f1edff]"
                            : "text-[#f1edff] hover:text-[#122c4a]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="opacity-90 transition-transform duration-300 group-hover:-translate-y-0.5">
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                      
                      {/* Active underline */}
                      <span
                        className={`absolute inset-x-5 -bottom-[3px] h-[2px] rounded-full transition-opacity duration-300 ${
                          index === activeIndex
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-60"
                        }`}
                        style={{
                          backgroundImage: `linear-gradient(90deg, ${highlightStart}, ${highlightEnd})`,
                        }}
                      />
                    </Link>
                  );
                })}
              </div>
              
              {/* Dynamic scroll highlight: Sea to Sahara Journey */}
              <div
                className="pointer-events-none absolute bottom-0 h-[3px] rounded-full transition-transform duration-[600ms] ease-out"
                style={{
                  width: `${itemWidth}%`,
                  transform: `translateX(${journeyTravel}%)`,
                  backgroundImage: `linear-gradient(90deg, ${highlightStart}, ${highlightEnd})`,
                  boxShadow: `0 0 10px ${isNight ? "rgba(255, 208, 115, 0)" : "rgba(25,97,143,0.3)"}`
                }}
              />
            </div>
          </nav>

          <div className="flex items-center gap-3 relative z-20">
            

            <button
              className="rounded-lg p-2 text-[#e6f7ff] transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe0a3] lg:hidden"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            <Link
              href="/register"
              className="relative z-10 rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_8px_24px_rgba(255,197,97,0.4)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,197,97,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff2d2]"
              style={{
                borderColor: isNight ? "rgba(186, 202, 255, 0.45)" : "rgba(255, 227, 172, 0.06)",
                color: isNight ? "#f3f0ff" : "#112344",
                backgroundImage: isNight
                  ? "linear-gradient(90deg, rgba(38,54,105,0.94), rgba(86,53,76,0.92))"
                  : "linear-gradient(90deg, rgba(236,247,255,0.98), rgba(255, 208, 138, 0.16))",
              }}
            >
              Register
            </Link>
          </div>
        </div>
        </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation"
        className={`fixed left-3 right-3 sm:left-6 sm:right-6 top-[85px] lg:hidden z-[60] transition-all duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto shadow-2xl scale-100"
            : "opacity-0 -translate-y-4 pointer-events-none shadow-none scale-95"
        }`}
        aria-hidden={!isOpen}
      >
        <div
          className="overflow-hidden rounded-2xl border p-3 backdrop-blur-xl transition-colors duration-700"
          style={{
            borderColor: shellBorder,
            backgroundImage: `linear-gradient(180deg, ${seaTone} 100%, ${saharaTone} 10%)`,
            boxShadow: isOpen ? "0 20px 48px rgba(9, 18, 38, 0.45)" : "none",
          }}
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2 relative z-50">
            {navItems.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-base font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe0a3] ${
                    isActive
                      ? "bg-white/20"
                      : "bg-black/10 hover:bg-white/10"
                  }`}
                  style={{
                    borderColor: isActive
                      ? isNight
                        ? "rgba(203, 212, 255, 0.6)"
                        : "rgba(255, 241, 204, 0.65)"
                      : "rgba(255, 255, 255, 0.1)",
                    color: isNight ? "#e6e9ff" : "#f6f8ff",
                  }}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </span>
                  <span className={`h-2 w-2 rounded-full transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} 
                        style={{ backgroundImage: `linear-gradient(90deg, ${highlightStart}, ${highlightEnd})` }} />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
