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

const galleryItems = Array.from({ length: 22 }, (_, i) => ({
  src: `/image${i + 1}.jpg`,
  title: `AEC Moment ${String(i + 1).padStart(2, '0')}`,
  subtitle: 'Innovation • Teamwork • Competition',
}));

export default function Slider() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full h-full flex flex-col justify-center gap-4 md:gap-6 px-2">
      <div className="flex items-center justify-between text-white px-1">
        <h3 className="text-[#FFC200] text-xs md:text-sm tracking-[0.2em] uppercase">AEC Gallery</h3>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous slide"
            className="gallery-prev h-9 w-9 rounded-full bg-[#110038]/70 border border-white/20 text-[#FFC200] hover:bg-[#FFC200] hover:text-[#110038] transition"
          >
            &lt;
          </button>
          <button
            aria-label="Next slide"
            className="gallery-next h-9 w-9 rounded-full bg-[#110038]/70 border border-white/20 text-[#FFC200] hover:bg-[#FFC200] hover:text-[#110038] transition"
          >
            &gt;
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Keyboard, A11y, Autoplay, Thumbs]}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        navigation={{ nextEl: '.gallery-next', prevEl: '.gallery-prev' }}
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        loop
        speed={900}
        centeredSlides
        slidesPerView={1.15}
        breakpoints={{
          768: { slidesPerView: 1.2 },
          1280: { slidesPerView: 1.1 },
        }}
        spaceBetween={18}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-[54vh] md:h-[64vh]"
      >
        {galleryItems.map((item, index) => (
          <SwiperSlide key={item.src} className="rounded-2xl overflow-hidden border border-white/15 bg-[#110038]/40">
            <div className="relative h-[54vh] md:h-[64vh]">
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 95vw, 68vw"
                priority={index === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110038]/90 via-[#110038]/15 to-transparent" />
              
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        modules={[Thumbs]}
        onSwiper={setThumbsSwiper}
        watchSlidesProgress
        spaceBetween={10}
        slidesPerView={4.2}
        breakpoints={{
          640: { slidesPerView: 5.2 },
          1024: { slidesPerView: 7.2 },
        }}
        className="w-full"
      >
        {galleryItems.map((item, index) => (
          <SwiperSlide key={`${item.src}-thumb`} className="!h-16 md:!h-20 cursor-pointer rounded-xl overflow-hidden border border-white/20">
            <div className="relative h-full w-full">
              <Image
                src={item.src}
                alt={`${item.title} thumbnail`}
                fill
                sizes="(max-width: 768px) 20vw, 12vw"
                loading={index < 8 ? 'eager' : 'lazy'}
                className="object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
