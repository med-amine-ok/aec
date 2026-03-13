"use client";
import dynamic from "next/dynamic";
import Bottom from "./components/bottom";
import ErrorBoundary from "./components/error";
import FAQ from "./components/faq";
import Navbar from "./components/navbar";
import "./globals.css";
import Fisrt from "./components/home";

const MaqamScene = dynamic(() => import("./components/MaqamScene"), {
  ssr: false,
});

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="relative overflow-hidden">
        {/* Cinematic 3D Maqam Experience (fixed, z-20) */}
        <MaqamScene />

        {/* Navbar — above all layers (fixed, z-50) */}
        <Navbar />

        {/* Page Content */}
        <div className="relative z-10 flex flex-col">
          <Fisrt />
          {/* AEC Experience scroll spacer — transparent to reveal 3D scene */}
          {/* 200vh pre-phrase + 200vh phrase zone + 200vh post-phrase = 600vh */}
          <div id="aec-experience" style={{ height: "600vh" }} />
        </div>
        {/* Bottom content — above 3D scene (z-30) */}
        <div className="relative z-30 flex flex-col">
          <FAQ />
          <Bottom />
        </div>
      </div>
    </ErrorBoundary>
  );
}
