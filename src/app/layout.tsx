import './globals.css';
import { roboto, archivo } from '@/styles/font';
import { Suspense } from 'react';
import ClientProviders from '@/components/providers/ClientProviders';
import Body from '@/components/general-components/body';
import WebVitalsInitializer from '@/components/providers/WebVitalsInitializer';
import HotToaster from '@/components/providers/HotToaster';
import HeaderFooterWrapper from '@/components/new-homepage/header_footer_wrapper';
import GlobalPropertyActionsFAB from '@/components/common/GlobalPropertyActionsFAB';
import SubscriptionFeaturesClient from '@/components/subscription/SubscriptionFeaturesClient';
import PromoMount from '@/components/promo/PromoMount';
import ChunkErrorHandler from '@/components/ChunkErrorHandler';
import WhatsAppChatWidget from '@/components/whatsapp-chat-widget';

// Skip static prerender — monorepo + mixed Windows path casing can break App Router context during build.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Khabiteq',
  description:
    "Simplifying real estate transactions in Lagos. Buy, sell, rent, and manage properties with ease through Khabi-Teq's trusted platform",
  icons: {
    icon: '/khabiteq_logo_nobg.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'https://www.khabiteqrealty.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Epilogue:wght@400;500;600;700&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${roboto.variable} ${archivo.variable} antialiased`}>
        <ClientProviders>
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
          <HotToaster />
          <ChunkErrorHandler />
        </ClientProviders>
      </body>
    </html>
  );
}
