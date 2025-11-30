/** @format */

import type { Metadata } from "next";
import { PostPropertyProvider } from "@/context/post-property-context";

export const metadata: Metadata = {
  title: "Khabiteq | Post Property",
  description: `Simplifying real estate transactions in Lagos. Buy, sell, rent, and manage properties with ease through Khabi-Teq's trusted platform`,
  icons: {
    icon: "/khabi-teq.svg",
  },
};

export default function SellPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PostPropertyProvider>{children}</PostPropertyProvider>;
}
