"use client";
import dynamic from "next/dynamic";
import Bottom from "./components/bottom";
import ErrorBoundary from "./components/error";
import FAQ from "./components/faq";
import Navbar from "./components/navbar";
import "./globals.css";
import Fisrt from "./components/home";
import Aec from "./components/Aec";
import LogoLoop from "./components/LogoLoop";

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="relative w-full overflow-x-hidden max-w-[100vw]">
        {/* Navbar — above all layers (fixed, z-50) */}
        <Navbar />

        {/* Page Content */}
        <div className="relative z-30 flex flex-col">
          <Fisrt />
          {/* Main AEC section */}
          <Aec />
        </div>

        {/* Sponsors Logo Scroll Section */}
        <div
          id="sponsors"
          className="relative z-30 flex flex-col items-center w-full py-8 md:py-14"
          style={{ background: "#1B4D80" }}
        >
          {/* Decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#F3C623] to-transparent opacity-30"></div>

          <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-[#EB8317] mb-3">
            Proudly Supported By
          </span>
          <h2
            className="aec text-3xl md:text-5xl font-semibold mb-2"
            style={{
              background:
                "linear-gradient(135deg, #F4F6FF 0%, #BAD7E9 50%, #F4F6FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Our Sponsors
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#F3C623] to-transparent  rounded-full"></div>

          <div className="w-full max-w-6xl mx-auto mt-6 bg-[#F4F6FF] py-3 md:py-5 px-4 rounded-3xl shadow-[0_12px_40px_rgba(244,246,255,0.05)] border border-white/20 relative overflow-hidden">
            {/* Subtle inner shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"></div>

            <div className="relative z-10 w-full">
              <LogoLoop
                logos={[
                  { src: "/viclogo.png", alt: "VIC" },
                  { src: "/inphamedis.png", alt: "INPHAMEDIS" },
                ]}
                speed={100}
                direction="left"
                logoHeight={80}
                gap={80}
                scaleOnHover
                fadeOut
                fadeOutColor="#F4F6FF"
                ariaLabel="Sponsors logos"
              />
            </div>
          </div>
        </div>
{/* 
        <div
          className="relative z-30 flex flex-col items-center w-full py-8 md:py-14"
          style={{ background: "#1B4D80" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#F3C623] to-transparent opacity-30 "></div>

          <h2
            className="aec text-3xl md:text-5xl font-semibold mb-2 mt-[-0.5rem]"
            style={{
              background:
                "linear-gradient(135deg, #F4F6FF 0%, #BAD7E9 50%, #F4F6FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Our Media Partners
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#F3C623] to-transparent rounded-full"></div>

          <div className="w-full max-w-6xl mx-auto mt-6 bg-[#F4F6FF] py-3 md:py-5 px-4 rounded-3xl shadow-[0_12px_40px_rgba(244,246,255,0.05)] border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"></div>

            <div className="relative z-10 w-full">
              <LogoLoop
                logos={[
                  { src: "/El_Bilad.png", alt: "EL BILAD" },
                  
                 
                  { src: "/ch1.png", alt: "ch1" },
                   { src: "/jow.svg", alt: "JOW" },
                  { src: "/jilfm.png", alt: "JILFM" },
                ]}
                speed={100}
                direction="right"
                logoHeight={80}
                gap={80}
                scaleOnHover
                fadeOut
                fadeOutColor="#F4F6FF"
                ariaLabel="Sponsors logos"
              />
            </div>
          </div>
        </div> */}

        <div className="relative z-30 flex flex-col">
          <FAQ />
          {/* Decorative divider between FAQ and footer */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#BAD7E9]/20 to-transparent"></div>
          <Bottom />
        </div>
      </div>
    </ErrorBoundary>
  );
}
