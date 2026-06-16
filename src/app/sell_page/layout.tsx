/** @format */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Khabiteq | Sell page',
  description: `Simplifying real estate transactions in Lagos. Buy, sell, rent, and manage properties with ease through Khabi-Teq's trusted platform`,
  icons: {
    icon: '/khabiteq_logo_nobg.png',
  },
};

export default function SellPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
