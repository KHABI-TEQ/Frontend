import './globals.css';
import { roboto, archivo } from '@/styles/font';
import { lazy, Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import ClientProviders from '@/components/providers/ClientProviders';

// Dynamic imports keep the root layout chunk small and avoid ChunkLoadError timeouts in dev.
const Body = nextDynamic(
  () => import('@/components/general-components/body'),
  { ssr: true }
);
const WebVitalsInitializer = nextDynamic(
  () => import('@/components/providers/WebVitalsInitializer'),
  { ssr: true }
);
const HotToaster = nextDynamic(
  () => import('react-hot-toast').then((mod) => {
    const { Toaster } = mod;
    return function DynamicToaster() {
      return <Toaster />;
    };
  }),
  { ssr: true }
);

const HeaderFooterWrapper = nextDynamic(
  () => import('@/components/new-homepage/header_footer_wrapper').then((m) => m.default),
  { ssr: true }
);

// Lazy load non-critical components - these are not needed on initial render
const GlobalPropertyActionsFAB = nextDynamic(() => import('@/components/common/GlobalPropertyActionsFAB'), { ssr: true });
const SubscriptionFeaturesClient = nextDynamic(() => import('@/components/subscription/SubscriptionFeaturesClient'), { ssr: true });
const PromoMount = nextDynamic(() => import('@/components/promo/PromoMount'), { ssr: true });
const ChunkErrorHandler = nextDynamic(() => import('@/components/ChunkErrorHandler'), { ssr: true });
const WhatsAppChatWidget = lazy(() => import('@/components/whatsapp-chat-widget'));

// Skip static prerender — monorepo + mixed Windows path casing can break App Router context during build.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Khabiteq',
  description:
    "Simplifying real estate transactions in Lagos. Buy, sell, rent, and manage properties with ease through Khabi-Teq's trusted platform",
  icons: {
    icon: '/khabi.svg',
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
          <Suspense fallback={null}>
            <ChunkErrorHandler />
          </Suspense>
        </ClientProviders>
      </body>
    </html>
  );
}
