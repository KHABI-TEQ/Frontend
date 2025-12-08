/** @format */

"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { usePageContext } from "@/context/page-context";
import randomImage from "@/assets/noImageAvailable.png";
import { StaticImageData, StaticImport } from "next/dist/shared/lib/get-img-props";

interface LazyImageSwiperProps {
  images: (StaticImageData | StaticImport | string)[];
}

const getValidImageUrl = (url: StaticImageData | StaticImport | string | undefined): string => {
  if (!url) return randomImage.src;
  if (typeof url === "string") {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("www.")) return `https://${url}`;
    if (url.startsWith("/")) return url;
    return randomImage.src;
  }
  if (typeof url === "object" && "src" in url) {
    return url.src;
  }
  return randomImage.src;
};

const LazyImageSwiper: React.FC<LazyImageSwiperProps> = ({ images }) => {
  const swiperRef = React.useRef<any>(null);
  const { setViewImage, setImageData } = usePageContext();

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  return (
    <div className="w-full h-full absolute">
      <Swiper
        modules={[Pagination, Navigation, Autoplay]}
        spaceBetween={3}
        slidesPerView={1}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="w-full h-[148px] cursor-pointer"
      >
        {images.map((src, i) => {
          const validImageUrl = getValidImageUrl(src);
          return (
            <SwiperSlide
              onClick={() => {
                setImageData(images);
                setViewImage(true);
              }}
              key={i}
            >
              <Image
                width={1000}
                height={1000}
                src={validImageUrl}
                alt={`Slide ${i + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = randomImage.src;
                }}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default LazyImageSwiper;
