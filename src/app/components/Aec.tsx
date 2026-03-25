import "../globals.css";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, animate } from "framer-motion";
import { MapPin, Instagram } from "lucide-react";
import Slider from "./swiper";

import { useEffect, useRef, useState } from "react";

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => setCount(Math.floor(latest)),
      });
      return () => controls.stop();
    }
  }, [value, isInView]);

  return <span ref={ref}>{count}</span>;
}

const cities = [
  { id: "algiers", name: "Algiers", x: "53%", y: "8%", logo: "/viclogo.png", club: "Visionary Innovation Club", place: "National School Polytechnic of Algiers", insta: "https://www.instagram.com/vic.enp/" },
  { id: "oran", name: "Oran", x: "40%", y: "16%", logo: "/ep.png", club: "", place: "National School Polytechnic of Oran", insta: "https://www.instagram.com/vic.enp/" },
  { id: "constantine", name: "Constantine", x: "65%", y: "13%", logo: "/skybridge.png", club: "Skybridge Club", place: "National School Polytechnic of Constantine", insta: "https://www.instagram.com/skybridge.club/" },
  { id: "ouargla", name: "Ouargla", x: "61%", y: "38%", logo: "/SCO.PNG", club: "Scientific Corner Ouargla", place: "University of Ouargla", insta: "https://www.instagram.com/scientific_corner/" },
];

type City = {
  x: string;
  y: string;
};

const toPx = (value: string, size: number) => {
  return (parseFloat(value) / 100) * size;
};

const getCurvedPath = (
  from: City,
  to: City,
  width: number,
  height: number,
  curvature: number = 1
): string => {
  const x1 = toPx(from.x, width);
  const y1 = toPx(from.y, height);

  const x2 = toPx(to.x, width);
  const y2 = toPx(to.y, height);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Use the ID or coordinates to create a stable "random" direction for SSR
  const dx = parseFloat(from.x) - parseFloat(to.x);
  const direction = dx > 0 ? 1 : -1;

  const baseOffset = 60 * direction;
  const finalOffset = baseOffset * curvature;

  return `M ${x1},${y1} Q ${midX},${midY + finalOffset} ${x2},${y2}`;
};



export default function Aec() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return (
    <div id="aec-experience" className="w-full flex flex-col items-center">
      {/* Subtle radial glow behind this section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#BAD7E9]/[0.06] blur-[120px]"></div>
      </div>
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

      <section
        id="aec-about"
        className="relative w-full max-w-6xl mx-auto px-6 py-28 overflow-hidden"
      >
        {/* 🔷 BACKGROUND GRID */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,77,128,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(27,77,128,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* 🔥 ENERGY CORE */}
        <motion.div
          className="absolute right-[20%] top-1/2 w-[400px] h-[400px] -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(235,131,23,0.25), transparent 60%)",
            filter: "blur(60px)",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="relative flex flex-col md:flex-row items-center gap-16">

          {/* 🔷 LEFT CONTENT */}
          <motion.div
            className="w-full md:w-1/2 space-y-6 z-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="text-xs tracking-[0.25em] text-[#EB8317] uppercase">
              About the Competition
            </span>

            <h2 className="aec text-4xl md:text-5xl font-bold bg-gradient-to-br from-[#F4F6FF] to-[#BAD7E9] bg-clip-text text-transparent drop-shadow-[0_4px_2px_rgba(27,77,128,0.6)] mb-4">
              WHAT IS AEC
            </h2>

            {/* 🧠 PROGRESSIVE TEXT */}
            <motion.p
              className="font-medium text-[#F4F6FF] leading-relaxed"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              {[
                "The Algerian Engineering Competition (AEC) is a ",
                "national engineering event ",
                "where participants tackle  ",
                "real-world challenges",
                "proposed by industry and guided by experts. ",
                "Open to students, startups, graduates, and researchers, ",
                "AEC",
                "connects Algerian talent with industrial needs, ",
                "fostering ",
                "innovation",
                " and practical ",
                "problem-solving.",
                " Previous editions have brought together participants from across ",
                "the country",
                " and the diaspora, offering a platform to showcase skills, creativity, and impact",
                ".",
              ].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ 
                    duration: 1.1, 
                    delay: i * 0.15,
                    ease: [0.21, 0.47, 0.32, 0.98]
                  }}
                  className={
                    ["national engineering event ", "real-world challenges", "AEC", "innovation", "problem-solving.", "the country"].includes(word)
                      ? "mx-1 px-1 rounded bg-gradient-to-r from-[#EB8317] to-[#F3C623] text-white inline-block"
                      : ""
                  }
                >
                  {word}
                </motion.span>
              ))}
            </motion.p>

            {/* TAGS */}
            <div className="flex flex-wrap gap-3">
              {["Innovation", "Teamwork", "National Impact", "Real Problems"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full text-xs font-medium tracking-wide border border-[#1B4D80]/10 bg-white/60 text-[#1B4D80] hover:border-[#EB8317] hover:text-[#EB8317] transition"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </motion.div>

          {/* 🔥 RIGHT STATS (LAYERED + DEPTH) */}
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-4 md:gap-6 relative z-10 mt-12 md:mt-0 perspective-1000">
            {/* 🔥 ENERGY CORE */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(235,131,23,0.15), transparent 70%)",
                filter: "blur(40px)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            {[
              { number: 100, suffix: "+", label: "Teams", desc: "Solving challenges", accent: "#EB8317" },
              { number: 400, suffix: "+", label: "Participants", desc: "Top tech talents", accent: "#F3C623" },
              { number: 69, suffix: "", label: "Wilayas", desc: "National reach", accent: "#BAD7E9" },
              { number: 5, suffix: "", label: "Editions", desc: "Years of success", accent: "#EB8317" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
                className="group relative flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(27,77,128,0.4)]"
                style={{
                  background: "linear-gradient(135deg, rgba(16,55,92,0.6) 0%, rgba(27,77,128,0.3) 100%)",
                  border: "1px solid rgba(186,215,233,0.1)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                {/* Accent Glow on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at top right, ${stat.accent}20, transparent 65%)`,
                  }}
                />

                <span
                  className="aec text-4xl md:text-5xl font-black mb-1 relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-105"
                  style={{ color: stat.accent }}
                >
                  <Counter value={stat.number} />{stat.suffix}
                </span>

                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-white uppercase relative z-10 mb-1">
                  {stat.label}
                </span>

                <span className="text-[9px] md:text-[10px] text-[#BAD7E9]/60 font-medium relative z-10 group-hover:text-[#BAD7E9] transition-colors text-center">
                  {stat.desc}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section
        id="aec-locations"
        className="relative w-full py-28 overflow-hidden"
        style={{ background: "#F4F6FF" }}
      >
        {/* 🔷 GRID OVERLAY */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,77,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(27,77,128,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* CONTENT WRAPPER */}
        <div className="relative z-10 max-w-6xl mx-auto text-center px-4 mb-15">
          <motion.div
            className="relative pointer-events-none z-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs tracking-[0.25em] text-[#EB8317] uppercase">
              Where We Compete
            </span>
            <h2 className="text-4xl font-bold text-[#1B4D80] mb-6 mt-3">
              NATIONAL NETWORK
            </h2>
          </motion.div>
        </div>

        {/* 🟢 MAP & NODES SYNCRONIZED CONTAINER */}
        <div className="relative w-[750px] sm:w-[800px] md:w-[900px] aspect-[4/3] left-1/2 transform -translate-x-[53%] sm:-translate-x-[54%] md:-translate-x-1/2 -mt-16 md:-mt-10">

          {/* 🔵 BACKGROUND MAP */}
          <img
            src="/alg.svg"
            alt="Algeria map"
            className="absolute inset-0 w-full h-full object-fill block pointer-events-none opacity-40 md:opacity-45"
            style={{ filter: "brightness(0)", WebkitFilter: "brightness(0)", transform: "translateZ(0)" }}
          />

          {/* 🔥 CONNECTION LINES */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            <defs>
              <linearGradient id="trackGradient" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1B4D80" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#BAD7E9" stopOpacity="1" />
                <stop offset="100%" stopColor="#1B4D80" stopOpacity="1" />
              </linearGradient>

              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[
              { target: 2, delay: 0 },
              { target: 1, delay: 0.15 },
              { target: 3, delay: 0.3 },
            ].map((conn, idx) => {
              const from = cities[conn.target];
              const to = cities[0];

              if (!from || !to || !size.width) return null;

              // Neural bundle of fibers
              const filaments = [
                { curve: 0.8, opacity: 0.1, width: 1, delay: 0 },
                { curve: 1.0, opacity: 0.25, width: 2, delay: 0.05 },
                { curve: 1.2, opacity: 0.1, width: 1, delay: 0.1 },
              ];

              return (
                <g key={idx}>
                  {filaments.map((f, fIdx) => {
                    const path = getCurvedPath(from, to, size.width, size.height, f.curve);
                    return (
                      <g key={`f-${fIdx}`}>
                        {/* BASE FIBER */}
                        <motion.path
                          d={path}
                          stroke="url(#trackGradient)"
                          strokeWidth={f.width}
                          fill="none"
                          strokeDasharray={fIdx === 1 ? "none" : "4 8"}
                          initial={{ pathLength: 0, opacity: 0 }}
                          whileInView={{ pathLength: 1, opacity: f.opacity }}
                          transition={{
                            duration: 1.2,
                            ease: "easeOut",
                            delay: conn.delay + f.delay,
                          }}
                        />

                        {/* NEURAL PULSE (Firing Signal) */}
                        {fIdx === 1 && (
                          <motion.path
                            d={path}
                            stroke="#1B4D80"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            filter="url(#glow)"
                            initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                            whileInView={{
                              pathLength: [0, 0.15, 0.15, 0],
                              pathOffset: [0, 0, 0.85, 1],
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: conn.delay + 1,
                            }}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* 🟠 NODES */}
          {cities.map((city, i) => (
            <motion.div
              key={city.id}
              tabIndex={0}
              className="absolute flex flex-col items-center group cursor-pointer z-30 hover:z-50 focus:z-50 focus-within:z-50 focus:outline-none"
              style={{ left: city.x, top: city.y, transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {/* GLOW PULSE */}
              <div className="absolute z-0 w-24 h-24 rounded-full bg-[#EB8317]/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500 animate-pulse pointer-events-none"></div>

              {/* NODE */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                className="relative z-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(27,77,128,0.15)] border border-[#1B4D80]/10 transition-all duration-500 group-hover:shadow-[0_12px_32px_rgba(235,131,23,0.25)] group-hover:border-[#EB8317]/30"
              >
                <img
                  src={city.logo}
                  alt={city.name}
                  className="w-10 h-10 md:w-14 md:h-14 object-contain"
                />
              </motion.div>

              {/* LABEL */}
              <span className="mt-3 text-xs md:text-sm font-bold tracking-widest text-[#10375C] group-hover:text-[#EB8317] transition bg-white/50 backdrop-blur-md px-2 py-1 rounded-md">
                {city.name}
              </span>

              {/* HOVER DETAILS CARD */}
              <div className="absolute top-full mt-2 md:mt-3 w-[200px] bg-white/95 backdrop-blur-2xl border border-[#1B4D80]/10 shadow-[0_20px_50px_rgba(27,77,128,0.25)] rounded-2xl p-4 opacity-0 translate-y-3 pointer-events-none transition-all duration-[400ms] group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus:opacity-100 group-focus:translate-y-0 group-focus:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto z-50 text-left">
                {/* Little triangle arrow pointing up */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-t border-l border-[#1B4D80]/10 rotate-45 backdrop-blur-2xl"></div>

                <div className="relative z-30">
                  <h4 className="text-[13px] font-black text-[#1B4D80] mb-2 uppercase tracking-wide">{city.club}</h4>
                  <div className="flex items-start gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#EB8317] mt-0.5" />
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#10375C]/70 leading-snug">
                      {city.place}
                    </p>
                  </div>
                  <a
                    href={city.insta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-[10px] uppercase font-bold tracking-widest text-white bg-gradient-to-r from-[#e1306c] to-[#f56040] hover:shadow-[0_4px_12px_rgba(225,48,108,0.35)] hover:-translate-y-0.5 px-3 py-2.5 rounded-xl transition-all duration-300"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Carousel Section */}
      <section
        id="aec-carousel"
        className="relative w-full px-4 md:px-10 py-16 md:py-24 overflow-hidden bg-[#F4F6FF]"
      >
        {/* Ambient background glow */}
        {/* <div className="absolute inset-0">
    <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#BAD7E9]/20 blur-[120px]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#EB8317]/20 blur-[120px]" />
  </div> */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto max-w-7xl rounded-[32px] border border-white/10 overflow-hidden bg-[#1B4D80]"
          style={{
            // background:
            //   "radial-gradient(circle at top left, rgba(186,215,233,0.12), transparent 45%), linear-gradient(135deg, rgba(27,77,128,0.55), rgba(16,55,92,0.85))",
            boxShadow:
              "0 40px 140px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255, 255, 255, 0)",
            backdropFilter: "blur(22px)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-8 lg:gap-12 items-center p-6 md:p-10">

            {/* LEFT CONTENT */}
            <div className="text-white space-y-6">
              <p className="text-xs md:text-sm tracking-[0.35em] text-[#BAD7E9]/70 uppercase">
                AEC GALLERY
              </p>

              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Relive AEC <br /> Moments
              </h2>

              <div className="w-16 h-[2px] bg-gradient-to-r from-[#EB8317] to-[#F3C623]" />

              <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
                Explore highlights from past editions of the Algerian Engineering Competition,
                where innovation, engineering, and creativity meet in one place.
              </p>

              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #EB8317, #F3C623)",
                  color: "#10375C",
                }}
              >
                REGISTER NOW
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            {/* RIGHT: CAROUSEL */}
            <div className="relative h-auto md:h-[75vh] w-full rounded-2xl overflow-hidden mt-6 md:mt-0">
              {/* Soft inner glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />

              {/* Carousel */}
              <div className="relative w-full h-full">
                <Slider />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
