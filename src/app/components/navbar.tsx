"use client";
import "../globals.css";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Trophy, Handshake, MessageCircleQuestion, Users, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const navItems = useMemo(
    () => [
      { name: "Home", href: "#home", icon: <Home size={16} /> },
      { name: "AEC", href: "#aec-experience", icon: <Trophy size={16} /> },
      { name: "Sponsors", href: "#sponsors", icon: <Handshake size={16} /> },
      { name: "FAQ", href: "#FAQ", icon: <MessageCircleQuestion size={16} /> },
      { name: "About Us", href: "#about-us", icon: <Users size={16} /> },
    ],
    []
  );

  useEffect(() => {
    const updateActive = () => {
      const sections = navItems
        .map((item) => document.getElementById(item.href.slice(1)))
        .filter(Boolean) as HTMLElement[];

      let current = "#home";
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.35) {
          current = `#${section.id}`;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", updateActive);
    return () => window.removeEventListener("scroll", updateActive);
  }, [navItems]);



  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 top-0 z-50 font-[Raleway]"
    >
      {/* NAV CONTAINER */}
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        className="relative mx-3 mt-3 rounded-4xl border backdrop-blur-3xl sm:mx-6 overflow-hidden shadow-[0_30px_70px_rgba(5,25,53,0.5)]"
        style={{
          background: "rgba(255, 255, 255, 0.09)",
          borderColor: "rgba(200, 199, 197, 0.17)",
        }}
      >
        {/* ✨ CURSOR GLOW */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(300px circle at ${mouse.x}px ${mouse.y}px, rgba(235,133,23,0.1), transparent 70%)`,
          }}
        />

        <div className="relative flex items-center justify-between px-4 py-3 lg:px-8">
          
          {/* LOGO */}
          <Link href="#home" className="flex items-center">
            <div className="relative group/logo">
              <motion.div
                className="absolute inset-0 bg-white/20 blur-3xl rounded-full opacity-0 group-hover/logo:opacity-50 transition-opacity duration-700"
                layoutId="logoGlow"
              />
              <Image
                src="/aecCH.svg"
                alt="AEC Logo"
                width={450}
                height={120}
                className="h-12 sm:h-14 w-auto object-contain scale-[1] sm:scale-[1] origin-left transition-all duration-700 ease-out group-hover/logo:scale-[1.2] sm:group-hover/logo:scale-[1.1] group-hover/logo:brightness-110 drop-shadow-[0_12px_45px_rgba(255,255,255,0.35)]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] group-hover/logo:animate-[shimmer_2s_infinite] pointer-events-none" />
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:block relative w-[55%] max-w-2xl">
            <div className="relative rounded-full border px-2 py-1 bg-white/20 backdrop-blur-md border-[#F4F6FF]/20 shadow-[0_30px_70px_rgba(5,25,53,0.5)]">
              
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
                }}
              >
                {navItems.map((item) => {
                  const isActive = activeSection === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group relative flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-300 ${
                        isActive
                          ? "text-[#1B4D80]"
                          : "text-[#1B4D80]/50 hover:text-[#1B4D80]"
                      }`}
                      onMouseMove={(e) => {
                        const el = e.currentTarget;
                        const rect = el.getBoundingClientRect();
                        const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
                        const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
                        el.style.transform = `translate(${x}px, ${y}px)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translate(0,0)";
                      }}
                    >
                      {/* Active Indicator Background Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute inset-0 bg-white/40 shadow-[0_2px_10px_rgba(27,77,128,0.08)] rounded-full -z-10"
                          transition={{ type: "spring", bounce: 0.22, duration: 0.6 }}
                        />
                      )}
                      
                      {/* Hover Glow */}
                      <span
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(27,77,128,0.1), transparent 70%)",
                        }}
                      />

                      <span className="relative z-10">{item.icon}</span>
                      <span className="relative z-10">{item.name}</span>
                      
                      {/* Active Indicator Underline (Premium Version) */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute -bottom-1 left-4 right-4 h-[2.5px] rounded-full z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          style={{
                            background: "linear-gradient(90deg, #1B4D80, #EB8317)",
                            boxShadow: "0 2px 10px rgba(27,77,128,0.1), 0 1px 12px rgba(235, 131, 23, 0.35)",
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            
            {/* MOBILE MENU BUTTON */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-[#1B4D80]/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* REGISTER BUTTON */}
            <Link
              href="/register"
              className=" lg:block border border-[#eb851728] rounded-full px-5 py-2 text-sm font-semibold text-white bg-[#1B4D80] hover:bg-[#163e66] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              Register
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed left-3 right-3 top-[85px] lg:hidden transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="rounded-2xl border bg-white/90 backdrop-blur-xl p-3 shadow-xl border-[#1B4D80]/10">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? "bg-[#1B4D80]/10 text-[#1B4D80]"
                      : "text-[#1B4D80]/70 hover:bg-[#1B4D80]/5"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}