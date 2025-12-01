/** @format */

"use client";
import React, { Suspense, lazy } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePageContext } from "@/context/page-context";
import randomImage from "@/assets/noImageAvailable.png";

// Dynamically import Swiper components to optimize bundle
const Swiper = dynamic(
  () => import("swiper/react").then(mod => ({ default: mod.Swiper })),
  { ssr: true }
);

const SwiperSlide = dynamic(
  () => import("swiper/react").then(mod => ({ default: mod.SwiperSlide })),
  { ssr: true }
);

// Lazy load modules
let Autoplay: any, Navigation: any, Pagination: any;
if (typeof window !== 'undefined') {
  import("swiper/modules").then(mod => {
    Autoplay = mod.Autoplay;
    Navigation = mod.Navigation;
    Pagination = mod.Pagination;
  });
}

interface ImageSwiperProps {
  images: any[];
}

const getValidImageUrl = (url: any): string => {
  if (!url) return randomImage.src;
  if (typeof url === "string") {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("www.")) return `https://${url}`;
    if (url.startsWith("/")) return url;
    return randomImage.src;
  }
  // If it's a StaticImport (local import), try to get src property
  if (typeof url === "object" && url.src) {
    return url.src;
  }
  // Fallback to random image if we can't determine the URL
  return randomImage.src;
};


const ImageSwiper: React.FC<ImageSwiperProps> = ({ images }) => {
  const swiperRef = React.useRef<any>(null);
  const { setViewImage, setImageData } = usePageContext();

  // Handle both images array and pictures array from API
  let imageArray = images;
  if (!imageArray || imageArray.length === 0) {
    // Check if the first item has a pictures property (API data structure)
    if (images && images[0] && images[0].pictures) {
      imageArray = images[0].pictures;
    }
  }

  // Ensure we have a valid array and filter out null/undefined entries
  const validImages =
    imageArray && Array.isArray(imageArray) && imageArray.length > 0
      ? imageArray.filter((img) => img != null)
      : [randomImage];
      

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
        {validImages
          .map((src, i) => {

             const rawUrl = typeof src === "string" ? src : src.url ?? src;
            const validImageUrl = getValidImageUrl(rawUrl);

            if (!validImageUrl || typeof validImageUrl !== "string") {
              return null;
            }

            return (
              <SwiperSlide
                onClick={() => {
                  setImageData(validImages);
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
          })
          .filter(Boolean)}
      </Swiper>
    </div>
  );
};

export default ImageSwiper;
