// Modal utility functions for managing body scroll and responsive behavior

export const lockBodyScroll = () => {
  if (typeof document !== "undefined") {
    document.body.classList.add("no-scroll");
  }
};

export const unlockBodyScroll = () => {
  if (typeof document !== "undefined") {
    document.body.classList.remove("no-scroll");
  }
};

import { useEffect } from "react";

export const useModalBodyLock = (isOpen: boolean) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isOpen) {
        lockBodyScroll();
      } else {
        unlockBodyScroll();
      }

      return () => {
        unlockBodyScroll();
      };
    }
  }, [isOpen]);
};

export const getModalMaxWidth = (
  size: "sm" | "md" | "lg" | "xl" | "full" = "md",
) => {
  const sizes = {
    sm: "400px",
    md: "600px",
    lg: "800px",
    xl: "1000px",
    full: "95vw",
  };

  return sizes[size];
};

export const getResponsiveModalClasses = (
  size: "sm" | "md" | "lg" | "xl" = "md",
) => {
  const baseClasses =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50";

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md lg:max-w-2xl",
    lg: "max-w-lg lg:max-w-4xl",
    xl: "max-w-xl lg:max-w-6xl",
  };

  return `${baseClasses} ${sizeClasses[size]}`;
};
