import './globals.css';
import { roboto, archivo } from '@/styles/font';
import { Toaster } from 'react-hot-toast';
import Body from '@/components/general-components/body';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import ClientProviders from '@/components/providers/ClientProviders';
import WebVitalsInitializer from '@/components/providers/WebVitalsInitializer';

// Dynamic import to keep layout chunk small and avoid ChunkLoadError timeout (webpack) / HMR issues (Turbopack)
const HeaderFooterWrapper = dynamic(
  () => import('@/components/new-homepage/header_footer_wrapper').then((m) => m.default),
  { ssr: true }
);

// Lazy load non-critical components - these are not needed on initial render
const GlobalPropertyActionsFAB = dynamic(() => import('@/components/common/GlobalPropertyActionsFAB'), { ssr: true });
const SubscriptionFeaturesClient = dynamic(() => import('@/components/subscription/SubscriptionFeaturesClient'), { ssr: true });
const PromoMount = dynamic(() => import('@/components/promo/PromoMount'), { ssr: true });
const ChunkErrorHandler = dynamic(() => import('@/components/ChunkErrorHandler'), { ssr: true });
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
      <ClientProviders>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${roboto.variable} ${archivo.variable} antialiased`}
          >
            <div id="promo-top-placeholder"> </div>
            <HeaderFooterWrapper>
              <Body>{children}</Body>
            </HeaderFooterWrapper>
            <Suspense fallback={null}>
              <PromoMount slot="header" targetId="promo-top-placeholder" className="w-full overflow-hidden bg-transparent mb-4" height="h-20" />
            </Suspense>
            <Suspense fallback={null}>
              <GlobalPropertyActionsFAB />
            </Suspense>
            <Suspense fallback={null}>
              <SubscriptionFeaturesClient />
            </Suspense>
            <Suspense fallback={null}>
              <WhatsAppChatWidget />
            </Suspense>
            <WebVitalsInitializer />
            <Toaster />
            <Suspense fallback={null}>
              <ChunkErrorHandler />
            </Suspense>
          </body>
        </html>
      </ClientProviders>
    </GoogleOAuthProvider>
  );
}
