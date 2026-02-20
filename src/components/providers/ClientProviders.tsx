"use client";

import React from "react";
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

/**
 * All client-side providers in one place.
 * Used by root layout so ReduxWrapper is only imported in a Client Component,
 * which avoids Turbopack HMR "module factory is not available" errors.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
