/** @format */

"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  showFallback?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  priority = false,
  sizes,
  style,
  fallbackSrc,
  showFallback = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default fallback image
  const defaultFallback = "/khabi-teq.svg";

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If there's an error and we should show fallback
  if (imageError && showFallback) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={style}
      >
        {fallbackSrc ? (
          <Image
            src={fallbackSrc}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            className={className}
            style={style}
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-400" />
        )}
      </div>
    );
  }

  // If there's an error and no fallback should be shown
  if (imageError && !showFallback) {
    return null;
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={style}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={className}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
        // Add loading="lazy" for better performance
        loading={priority ? "eager" : "lazy"}
        // Add quality setting for better performance
        quality={75}
      />
    </div>
  );
};

export default OptimizedImage;
