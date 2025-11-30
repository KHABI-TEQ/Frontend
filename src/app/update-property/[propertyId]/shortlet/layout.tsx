/** @format */

import type { Metadata } from "next";
import { PostPropertyProvider } from "@/context/post-property-context";

export const metadata: Metadata = {
  title: "Khabiteq | Update Property - Shortlet",
  description: `Update your property for shortlet on Khabi-Teq's trusted platform. Simplifying real estate transactions in Lagos.`,
  icons: {
    icon: "/khabi-teq.svg",
  },
};

export default function UpdateShortletLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PostPropertyProvider>{children}</PostPropertyProvider>;
}
