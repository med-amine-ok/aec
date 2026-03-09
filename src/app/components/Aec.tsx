import "../globals.css";
import Link from "next/link";

import Slider from "./swiper";
export default function Aec() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Image Carousel Section */}
            <section id="aec-carousel" className="relative px-4 md:px-10 pb-10 md:pb-16">
              <div className="mx-auto max-w-7xl rounded-3xl border border-white/10  p-4 md:p-8">
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
            </section>
      {/* Section 1 */}
      <div
        id="aec-about"
        className="relative min-h-screen w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-10"
      >
        {/* 3D Maqam model appears here via scroll parallax */}
        <div className="relative w-[85%] md:w-1/2 max-w-4xl h-[260px] sm:h-[340px] md:h-[520px]">
          {/* The 3D Maqam Echahid model is rendered as a fixed overlay and aligns with this space */}
        </div>

        {/* Slogan + Description */}
        <div className="relative w-[90%] md:w-1/2 px-6 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-full max-w-xl">
            <h2 className="aec text-2xl md:text-5xl font-Request font-semibold text-[#FFC200] mb-6">
              WHAT IS AEC
            </h2>
            <p className="text-lg md:text-2xl font-Gilroy text-white">
              The Algerian Engineering Competition (AEC) is a national event
              that brings together engineering students, recent graduates, and
              industry experts to solve real-world problems through innovation
              and teamwork.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
