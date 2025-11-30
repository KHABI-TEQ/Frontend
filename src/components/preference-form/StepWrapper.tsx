/** @format */

"use client";
import React, { memo, useRef, useEffect } from "react";

interface StepWrapperProps {
  stepId: string;
  currentStep: number;
  targetStep: number;
  children: React.ReactNode;
  className?: string;
}

// Step wrapper that preserves component state and prevents unnecessary re-renders
const StepWrapper: React.FC<StepWrapperProps> = memo(
  ({ stepId, currentStep, targetStep, children, className = "" }) => {
    const isVisible = currentStep === targetStep;
    const hasBeenVisited = useRef(false);

    // Mark as visited when first shown
    useEffect(() => {
      if (isVisible && !hasBeenVisited.current) {
        hasBeenVisited.current = true;
      }
    }, [isVisible]);

    // Only render children once they've been visited to preserve state
    if (!hasBeenVisited.current && !isVisible) {
      return null;
    }

    return (
      <div
        className={className}
        style={{
          display: isVisible ? "block" : "none",
        }}
      >
        {children}
      </div>
    );
  },
);

StepWrapper.displayName = "StepWrapper";

export default StepWrapper;
