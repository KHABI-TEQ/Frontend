"use client";

import React, { ReactNode } from 'react';
import { NegotiationProvider } from '@/context/negotiation-context';

interface NegotiationContextWrapperProps {
  children: ReactNode;
  enabled?: boolean;
}

/**
 * Wrapper component that provides negotiation context to any part of the application
 * This makes the negotiation context globally accessible across different pages and components
 * 
 * Usage:
 * 1. Wrap your page/component with this wrapper to enable negotiation context
 * 2. Use useNegotiation() or useGlobalNegotiation() hooks within the wrapped component
 * 3. Call makeGloballyAccessible() to enable global access after initialization
 */
export const NegotiationContextWrapper: React.FC<NegotiationContextWrapperProps> = ({
  children,
  enabled = true
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <NegotiationProvider>
      {children}
    </NegotiationProvider>
  );
};

export default NegotiationContextWrapper;
