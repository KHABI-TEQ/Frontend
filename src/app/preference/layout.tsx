/** @format */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khabiteq | Preference page",
  description: `Simplifying real estate transactions in Lagos. Buy, sell, rent, and manage properties with ease through Khabi-Teq's trusted platform`,
  icons: {
    icon: "/khabi-teq.svg",
  },
};

export default function NewPreferencePageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
