/** @format */

import type { Metadata } from "next";
import { PostPropertyProvider } from "@/context/post-property-context";

export const metadata: Metadata = {
  title: "Khabiteq | Post Property - Joint Venture",
  description: `List your property for joint venture on Khabi-Teq's trusted platform. Simplifying real estate transactions in Lagos.`,
  icons: {
    icon: "/khabi-teq.svg",
  },
};

export default function JointVentureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PostPropertyProvider>{children}</PostPropertyProvider>;
}
