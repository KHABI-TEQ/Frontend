/** @format */
"use client";

import React, { useMemo } from "react";
import { usePageContext } from "@/context/page-context";
import PropertyImageLightboxModal from "@/components/common/PropertyImageLightboxModal";
import randomImage from "@/assets/noImageAvailable.png";

function normalizeGalleryUrls(imageData: unknown[]): string[] {
  const out: string[] = [];
  for (const item of imageData || []) {
    if (typeof item === "string") {
      if (item.trim()) out.push(item);
      continue;
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      if (typeof o.url === "string" && o.url.trim()) out.push(o.url);
      else if (typeof o.src === "string" && o.src.trim()) out.push(o.src);
    }
  }
  return out.length > 0 ? out : [randomImage.src];
}

/**
 * Full-screen swipeable gallery driven by PageContext (marketplace / cards).
 */
export default function PropertyGalleryOverlay() {
  const {
    viewImage,
    setViewImage,
    imageData,
    galleryInitialIndex,
    setGalleryInitialIndex,
  } = usePageContext();

  const urls = useMemo(
    () => normalizeGalleryUrls(imageData as unknown[]),
    [imageData]
  );

  return (
    <PropertyImageLightboxModal
      isOpen={viewImage}
      images={urls}
      initialIndex={galleryInitialIndex}
      onClose={() => {
        setViewImage(false);
        setGalleryInitialIndex(0);
      }}
    />
  );
}
