"use client";

import React, { useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

const motion = dynamic(() => import("framer-motion").then(mod => ({ default: mod.motion })) as any, { ssr: false });
const AnimatePresence = dynamic(() => import("framer-motion").then(mod => ({ default: mod.AnimatePresence })), { ssr: false });

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  fullscreen: "w-full h-full",
};

interface ModalRendererProps {
  title?: string;
  content: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "fullscreen";
  showCloseBtn?: boolean;
  disableOutsideClick?: boolean;
  onRequestClose: () => void;
}

const ModalContent: React.FC<{
  overlayRef: React.RefObject<HTMLDivElement>;
  handleClickOutside: (e: React.MouseEvent) => void;
  title?: string;
  content: React.ReactNode;
  size: "sm" | "md" | "lg" | "xl" | "fullscreen";
  showCloseBtn: boolean;
  onRequestClose: () => void;
}> = ({
  overlayRef,
  handleClickOutside,
  title,
  content,
  size,
  showCloseBtn,
  onRequestClose,
}) => {
  const MotionDiv = motion as any;
  const AnimatePresenceComp = AnimatePresence as any;

  return (
    <AnimatePresenceComp>
      <MotionDiv
        ref={overlayRef}
        onClick={handleClickOutside}
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <MotionDiv
          className={`relative bg-white rounded-xl shadow-xl w-full ${
            sizeMap[size]
          } ${size === "fullscreen" ? "" : "max-h-[90vh] overflow-auto"}`}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {showCloseBtn && (
            <button
              onClick={onRequestClose}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X size={20} />
            </button>
          )}
          {title && (
            <div className="p-4 border-b text-lg font-semibold text-gray-800">
              {title}
            </div>
          )}
          <div className="p-4">{content}</div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresenceComp>
  );
};

const ModalFallback = () => (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto" />
  </div>
);

export const ModalRenderer: React.FC<ModalRendererProps> = ({
  title,
  content,
  size = "md",
  showCloseBtn = true,
  disableOutsideClick = false,
  onRequestClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onRequestClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (!disableOutsideClick && e.target === overlayRef.current) {
      onRequestClose();
    }
  };

  return (
    <Suspense fallback={<ModalFallback />}>
      <ModalContent
        overlayRef={overlayRef as React.RefObject<HTMLDivElement>}
        handleClickOutside={handleClickOutside}
        title={title}
        content={content}
        size={size}
        showCloseBtn={showCloseBtn}
        onRequestClose={onRequestClose}
      />
    </Suspense>
  );
};

export default ModalRenderer;
