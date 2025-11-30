/** @format */

"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface CloudinaryImageProps {
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
  quality?: number;
  timeout?: number; // timeout in milliseconds
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  priority = false,
  sizes,
  style,
  fallbackSrc = "/khabi-teq.svg",
  quality = 75,
  timeout = 10000, // 10 seconds default timeout
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Check if the image is from Cloudinary with proper type checking
  const isCloudinaryImage =
    typeof src === "string" && src?.includes("cloudinary.com");

  const handleError = React.useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  // Create a timeout for Cloudinary images
  React.useEffect(() => {
    if (isCloudinaryImage && isLoading) {
      const timer = setTimeout(() => {
        if (isLoading) {
          setHasTimedOut(true);
          setImageError(true);
          setIsLoading(false);
        }
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [isCloudinaryImage, isLoading, timeout]);

  // Validate src parameter
  if (!src || typeof src !== "string") {
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
            unoptimized
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-400" />
        )}
      </div>
    );
  }

  // Optimize Cloudinary URL
  const optimizeCloudinaryUrl = (url: string) => {
    if (!url || typeof url !== "string" || !url.includes("cloudinary.com"))
      return url;

    // Add Cloudinary transformations for better performance
    try {
      const urlParts = url.split("/upload/");
      if (urlParts.length === 2) {
        const transformations = [
          "f_auto", // Auto format
          "q_auto:low", // Auto quality (low for faster loading)
          "w_800", // Max width 800px
          "h_600", // Max height 600px
          "c_limit", // Don't upscale
        ].join(",");

        return `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
      }
    } catch (error) {
      console.error("Error optimizing Cloudinary URL:", error);
    }

    return url;
  };

  // Show fallback if there's an error or timeout
  if (imageError || hasTimedOut) {
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
            // Use unoptimized for fallback to avoid further issues
            unoptimized
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-400" />
        )}
      </div>
    );
  }

  const optimizedSrc = isCloudinaryImage ? optimizeCloudinaryUrl(src) : src;

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={style}
        />
      )}
      <Image
        src={optimizedSrc}
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
        loading={priority ? "eager" : "lazy"}
        quality={quality}
        // Use unoptimized for development to avoid timeouts
        unoptimized={
          process.env.NODE_ENV === "development" && isCloudinaryImage
        }
      />
    </div>
  );
};

export default CloudinaryImage;
