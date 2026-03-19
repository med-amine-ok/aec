'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

import { A11y, Autoplay, Keyboard, Navigation, Pagination, Thumbs } from 'swiper/modules';

const galleryItems = Array.from({ length: 8 }, (_, i) => ({
  src: `/image${i + 1}.webp`,
  title: `AEC Moment ${String(i + 1).padStart(2, '0')}`,
  subtitle: 'Innovation • Teamwork • Competition',
}));

export default function Slider() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full h-auto md:h-full flex flex-col justify-center gap-4 md:gap-6 px-2">

      {/* MAIN SWIPER */}
      <Swiper
        modules={[Navigation, Pagination, Keyboard, A11y, Autoplay, Thumbs]}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        loop
        speed={1200}
        centeredSlides
        slidesPerView={1.08}
        spaceBetween={24}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 12 },
          768: { slidesPerView: 1.1, spaceBetween: 20 },
          1280: { slidesPerView: 1.05, spaceBetween: 24 },
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full aspect-[4/3] sm:aspect-video md:aspect-auto md:h-[64vh]"
      >
        {galleryItems.map((item, index) => (
          <SwiperSlide
            key={item.src}
            className="rounded-3xl overflow-hidden bg-[#110038]/30 border border-white/10 transition-all duration-700"
          >
            <div
              className={`relative w-full h-full transition-all duration-700 ${
                activeIndex === index
                  ? 'scale-100 opacity-100'
                  : 'scale-[0.92] opacity-60 blur-[1px]'
              }`}
            >
              {/* IMAGE */}
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 70vw"
                priority={index === 0}
                className="object-cover scale-105 transition-transform duration-700"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" />

              {/* TEXT OVERLAY */}
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10 text-white">
                <p className="text-xs tracking-[0.3em] text-white/60 uppercase">
                  {item.subtitle}
                </p>

               

                <div className="w-12 h-[2px] mt-3 bg-gradient-to-r from-[#EB8317] to-[#F3C623]" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* THUMBNAILS */}
      <Swiper
        modules={[Thumbs]}
        onSwiper={setThumbsSwiper}
        watchSlidesProgress
        spaceBetween={10}
        slidesPerView={4.2}
        breakpoints={{
          0: { slidesPerView: 3.2 },
          640: { slidesPerView: 5.2 },
          1024: { slidesPerView: 7.2 },
        }}
        className="w-full"
      >
        {galleryItems.map((item, index) => (
          <SwiperSlide
            key={`${item.src}-thumb`}
            className={`!h-16 md:!h-20 cursor-pointer rounded-xl overflow-hidden border transition-all duration-300
              ${
                activeIndex === index
                  ? 'border-[#F3C623] scale-105 opacity-100'
                  : 'border-white/10 opacity-50 hover:opacity-80'
              }`}
          >
            <div className="relative h-full w-full">
              <Image
                src={item.src}
                alt={`${item.title} thumbnail`}
                fill
                className="object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}