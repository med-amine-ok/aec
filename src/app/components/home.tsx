'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "./swiper";
import OceanSurface from "./OceanSurface";


export default function First() {
  return (
    <div>
      {/* Hero Section */}
      <div id="hero-section" className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden">
        <OceanSurface />
        
        <div className="relative flex flex-col items-center text-white text-center gap-2">
          <Image
            src="/bottom.png"
            alt="top-decoration"
            width={350}
            height={350}
            priority
            className="absolute -top-10 md:-left-27 -left-15 rotate-180 w-[150px] md:w-[350px] object-contain"
          />
          <div className="text-2xl md:text-4xl flex flex-col items-center">
            <div className="slogan text-2xl font-semibold flex flex-wrap justify-center">
              <span className="mr-2 md:mr-5">THINK</span>
              <span className="text-[#FFC200] mr-2 md:mr-5">BOLD</span>
              <span className="mr-2 md:mr-5">. BUILD</span>
              <span className="text-[#FFC200] mr-2 md:mr-5">SMART</span>
              <span className="mr-2 md:mr-5">.</span>
            </div>
            <div className="slogan text-2xl font-semibold flex flex-wrap justify-center">
              <span className="mr-2 md:mr-5">COMPETE</span>
              <span className="text-[#FFC200] mr-2 md:mr-5">HARD</span>
              <span className="mr-2 md:mr-5">.</span>
            </div>
          </div>

          <Image
            src="/bottom.png"
            alt="bottom-decoration"
            width={350}
            height={350}
            priority
            className="absolute -bottom-10 md:-right-10 -right-5 w-[150px] md:w-[350px] object-contain"
          />
          <Link
                href="/register"
                className="inline-flex bg-[#FFC200] text-[#110038] py-2 px-5 mt-5 rounded-md font-bold text-lg md:text-2xl"
              >
                REGISTER NOW
              </Link>
        </div>
      </div>

      {/* Image Carousel Section */}
      {/* <section className="relative px-4 md:px-10 pb-10 md:pb-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-[#110038]/60 backdrop-blur-md p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 items-center">
            <div className="text-white space-y-4 lg:pr-6">
             
              <h2 className="aec text-3xl md:text-5xl leading-tight">
                Relive AEC
                <br />
                Moments
              </h2>
             
              <Link
                href="/register"
                className="inline-flex bg-[#FFC200] text-[#110038] py-2 px-5 rounded-md font-bold text-lg md:text-2xl"
              >
                REGISTER NOW
              </Link>
            </div>

            <div className="lg:col-span-2 h-[70vh] md:h-[82vh]">
              <Slider />
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
