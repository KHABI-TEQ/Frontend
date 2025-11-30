/** @format */

"use client";
import React, { memo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OptimizedStepWrapperProps {
  stepId: string;
  currentStep: number;
  targetStep: number;
  children: React.ReactNode;
  className?: string;
}

// Enhanced step wrapper with mobile optimizations and state preservation
const OptimizedStepWrapper: React.FC<OptimizedStepWrapperProps> = memo(
  ({ stepId, currentStep, targetStep, children, className = "" }) => {
    const isVisible = currentStep === targetStep;
    const hasBeenVisited = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
 
    // Detect mobile viewport
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Mark as visited when first shown
    useEffect(() => {
      if (isVisible && !hasBeenVisited.current) {
        hasBeenVisited.current = true;
      }
    }, [isVisible]);

    // Scroll to top when step changes (both mobile and desktop for consistency)
    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          // On mobile, scroll to the container if it exists
          if (isMobile && containerRef.current) {
            containerRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            // On desktop, scroll to top of page
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }, 200); // Increased timeout for better stability
        return () => clearTimeout(timer);
      }
    }, [isVisible, isMobile]);

    // Only render children once they've been visited to preserve state
    if (!hasBeenVisited.current && !isVisible) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        className={`${className} ${isVisible ? "block" : "hidden"}`}
      >
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              key={`step-${stepId}-${targetStep}`}
              initial={{
                opacity: 0,
                x: isMobile ? 0 : 50,
                y: isMobile ? 20 : 0,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
              }}
              exit={{
                opacity: 0,
                x: isMobile ? 0 : -50,
                y: isMobile ? -20 : 0,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="w-full"
            >
              <div className="space-y-4 sm:space-y-6">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

OptimizedStepWrapper.displayName = "OptimizedStepWrapper";

export default OptimizedStepWrapper;
