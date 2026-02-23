"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleOAuthConfigProvider } from "@/context/google-oauth-context";
import ReduxWrapper from "@/components/providers/ReduxWrapper";
import { UserProvider } from "@/context/user-context";
import { NotificationProvider } from "@/context/notification-context";
import { ModalProvider } from "@/context/modalContext";
import { PageContextProvider } from "@/context/page-context";
import { SelectedBriefsProvider } from "@/context/selected-briefs-context";
import { NewMarketplaceProvider } from "@/context/new-marketplace-context";
import { GlobalPropertyActionsProvider } from "@/context/global-property-actions-context";
import NegotiationContextWrapper from "@/components/common/NegotiationContextWrapper";
import { PromoProvider } from "@/context/promo-context";
import SubscriptionInitializer from "@/components/providers/SubscriptionInitializer";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const hasValidGoogleClientId =
  typeof googleClientId === "string" &&
  googleClientId.length > 0 &&
  !googleClientId.includes("not-configured");

/**
 * All client-side providers in one place.
 * Used by root layout so ReduxWrapper is only imported in a Client Component,
 * which avoids Turbopack HMR "module factory is not available" errors.
 * GoogleOAuthProvider lives here to keep the root layout chunk small and avoid ChunkLoadError timeout.
 * Only mounts GoogleOAuthProvider when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set to avoid "Missing required parameter client_id" from Google.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const content = (
    <GoogleOAuthConfigProvider isConfigured={hasValidGoogleClientId}>
    <ReduxWrapper>
      <UserProvider>
        <SubscriptionInitializer />
        <NotificationProvider>
          <ModalProvider>
            <PageContextProvider>
              <SelectedBriefsProvider>
                <NewMarketplaceProvider>
                  <GlobalPropertyActionsProvider>
                    <NegotiationContextWrapper>
                      <PromoProvider>
                        {children}
                      </PromoProvider>
                    </NegotiationContextWrapper>
                  </GlobalPropertyActionsProvider>
                </NewMarketplaceProvider>
              </SelectedBriefsProvider>
            </PageContextProvider>
          </ModalProvider>
        </NotificationProvider>
      </UserProvider>
    </ReduxWrapper>
    </GoogleOAuthConfigProvider>
  );

  if (hasValidGoogleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
  }
  return content;
}
