import './globals.css';
import HeaderFooterWrapper from '@/components/new-homepage/header_footer_wrapper';
import { roboto, archivo } from '@/styles/font';
import { Toaster } from 'react-hot-toast';
import Body from '@/components/general-components/body';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from '@/context/user-context';
import { NotificationProvider } from '@/context/notification-context';
import { ModalProvider } from '@/context/modalContext';
import { NewMarketplaceProvider } from '@/context/new-marketplace-context';
import { SelectedBriefsProvider } from '@/context/selected-briefs-context';
import { GlobalPropertyActionsProvider } from '@/context/global-property-actions-context';
import NegotiationContextWrapper from '@/components/common/NegotiationContextWrapper';
import { lazy, Suspense } from 'react';
import { PageContextProvider } from '@/context/page-context';
import dynamic from 'next/dynamic';
import ReduxWrapper from '@/components/providers/ReduxWrapper';
import SubscriptionInitializer from '@/components/providers/SubscriptionInitializer';
import { PromoProvider } from '@/context/promo-context';
import WebVitalsInitializer from '@/components/providers/WebVitalsInitializer';

// Lazy load non-critical components - these are not needed on initial render
const GlobalPropertyActionsFAB = dynamic(() => import('@/components/common/GlobalPropertyActionsFAB'), { ssr: true });
const SubscriptionFeaturesClient = dynamic(() => import('@/components/subscription/SubscriptionFeaturesClient'), { ssr: false });
const PromoMount = dynamic(() => import('@/components/promo/PromoMount'), { ssr: true });
const ChunkErrorHandler = dynamic(() => import('@/components/ChunkErrorHandler'), { ssr: false });
const WhatsAppChatWidget = lazy(() => import('@/components/whatsapp-chat-widget'));

export const metadata = {
  title: 'Khabiteq',
  description:
    "Simplifying real estate transactions in Lagos. Buy, sell, rent, and manage properties with ease through Khabi-Teq's trusted platform",
  icons: {
    icon: '/khabi-teq.svg',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'https://www.khabiteqrealty.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'google-client-id-not-configured'}>
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
                          <html lang="en" suppressHydrationWarning>
                            <body
                              className={`${roboto.variable} ${archivo.variable} antialiased`}
                            >
                              <div id="promo-top-placeholder" className="w-full overflow-hidden bg-transparent" />
                              <HeaderFooterWrapper>
                                <Body>{children}</Body>
                              </HeaderFooterWrapper>
                              <PromoMount slot="top-header" targetId="promo-top-placeholder" className="mb-2" height="h-20" />
                              <GlobalPropertyActionsFAB />
                              <SubscriptionFeaturesClient />
                              <Suspense fallback={null}>
                                <WhatsAppChatWidget />
                              </Suspense>
                              <WebVitalsInitializer />
                              <Toaster />
                              <ChunkErrorHandler />
                            </body>
                          </html>
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
    </GoogleOAuthProvider>
  );
}
