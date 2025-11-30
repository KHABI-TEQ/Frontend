/** @format */

import type { Metadata } from "next";
import { PostPropertyProvider } from "@/context/post-property-context";

export const metadata: Metadata = {
  title: "Khabiteq | Post Property - Rent",
  description: `List your property for rent on Khabi-Teq's trusted platform. Simplifying real estate transactions in Lagos.`,
  icons: {
    icon: "/khabi-teq.svg",
  },
};

export default function RentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PostPropertyProvider>{children}</PostPropertyProvider>;
}
