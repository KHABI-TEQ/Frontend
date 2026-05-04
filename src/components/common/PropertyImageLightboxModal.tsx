/** @format */
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

export interface PropertyImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  /** z-index for stacking above layout chrome */
  zIndexClass?: string;
}

export default function PropertyImageLightboxModal({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
  zIndexClass = "z-[100]",
}: PropertyImageLightboxModalProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(initialIndex);
  const safe = images.length > 0 ? images : [];

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActive(Math.min(Math.max(0, initialIndex), Math.max(0, safe.length - 1)));
    const s = swiperRef.current;
    if (s && safe.length > 0) {
      s.slideTo(Math.min(Math.max(0, initialIndex), safe.length - 1), 0);
    }
  }, [isOpen, initialIndex, safe.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || safe.length === 0) return null;

  const loop = safe.length > 1;

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex flex-col bg-black/90`}
      role="dialog"
      aria-modal="true"
      aria-label="Property photos"
      onClick={onClose}
    >
      <div
        className="flex shrink-0 justify-end p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          aria-label="Close gallery"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {safe.length > 1 && (
          <button
            type="button"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-900 shadow-lg hover:bg-white md:left-4"
            aria-label="Previous image"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <Swiper
          modules={[Keyboard]}
          keyboard={{ enabled: true }}
          loop={loop}
          slidesPerView={1}
          spaceBetween={0}
          initialSlide={Math.min(Math.max(0, initialIndex), safe.length - 1)}
          className="h-full w-full max-w-[min(100vw,1400px)]"
          onSwiper={(instance) => {
            swiperRef.current = instance;
          }}
          onSlideChange={(sw) => setActive(sw.realIndex)}
        >
          {safe.map((src, i) => (
            <SwiperSlide
              key={`${src}-${i}`}
              className="!flex items-center justify-center"
            >
              <div
                className="relative flex max-h-[min(85vh,900px)] w-full items-center justify-center p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={src}
                  alt={`Property photo ${i + 1}`}
                  width={1400}
                  height={933}
                  className="max-h-[min(85vh,900px)] w-auto max-w-full object-contain"
                  priority={i === active}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {safe.length > 1 && (
          <button
            type="button"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-900 shadow-lg hover:bg-white md:right-4"
            aria-label="Next image"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {safe.length > 1 && (
        <div
          className="shrink-0 pb-6 text-center text-sm text-white/90"
          onClick={(e) => e.stopPropagation()}
        >
          {active + 1} / {safe.length}
        </div>
      )}
    </div>
  );
}
