"use client";
import dynamic from "next/dynamic";
import Bottom from "./components/bottom";
import ErrorBoundary from "./components/error";
import FAQ from "./components/faq";
import Navbar from "./components/navbar";
import "./globals.css";
import Fisrt from "./components/home";
import LogoLoop from "./components/LogoLoop";
const MaqamScene = dynamic(() => import("./components/MaqamScene"), {
  ssr: false,
});


export default function Home() {
  return (
    <ErrorBoundary>
      <div className="relative overflow-hidden">
        {/* Cinematic scroll-driven Maqam Experience (fixed, z-20) */}
        <MaqamScene />

        {/* Navbar — above all layers (fixed, z-50) */}
        <Navbar />

        {/* Page Content */}
        <div className="relative z-30 flex flex-col">
          <Fisrt />
          {/* AEC Experience scroll spacer  transparent to reveal MaqamScene */}
          {/* 4 phases  150vh each = 600vh total */}
          <div id="aec-experience" style={{ height: "600vh" }} />
        </div>

        {/* Sponsors Logo Scroll Section */}
        <div id="sponsors" className="relative z-30 flex flex-col items-center py-1 w-full">
          <h2 className="aec text-3xl md:text-5xl text-[#e6f7ff] font-semibold ">Our Sponsors</h2>
            <div className="w-full mt-5">
            <LogoLoop
              logos={[
                { src: "/aec.png", alt: "AEC" },
                { src: "/caat.png", alt: "CAAT" },
                { src: "/cmc.png", alt: "CMC" },
                { src: "/dev.png", alt: "DEV" },
                { src: "/iec.png", alt: "IEC" },
                { src: "/pc.png", alt: "PC" },
                { src: "/petro.png", alt: "PETRO" },
                { src: "/quanta.png", alt: "QUANTA" },
                { src: "/seg.png", alt: "SEG" },
                { src: "/spe.png", alt: "SPE" },
                { src: "/tala.png", alt: "TALA" },
                { src: "/window.svg", alt: "WINDOW" },
                { src: "/youtube.png", alt: "YOUTUBE" }
              ]}
              speed={100}
              direction="left"
              logoHeight={60}
              gap={60}
              scaleOnHover
              fadeOut
              fadeOutColor="#e6f7ff00"
              ariaLabel="Sponsors logos"
            />
          </div>
        </div>

        {/* Bottom content  above MaqamScene (z-30) */}
        <div className="relative z-30 flex flex-col">
          <FAQ />
          <Bottom />
        </div>
      </div>
    </ErrorBoundary>
  );
}
