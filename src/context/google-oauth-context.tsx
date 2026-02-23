"use client";

import React, { createContext, useContext } from "react";

type GoogleOAuthConfig = {
  isConfigured: boolean;
};

const GoogleOAuthConfigContext = createContext<GoogleOAuthConfig>({ isConfigured: false });

export function GoogleOAuthConfigProvider({
  isConfigured,
  children,
}: {
  isConfigured: boolean;
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthConfigContext.Provider value={{ isConfigured }}>
      {children}
    </GoogleOAuthConfigContext.Provider>
  );
}

export function useGoogleOAuthConfig(): GoogleOAuthConfig {
  return useContext(GoogleOAuthConfigContext);
}
