/** @format */

import type { Metadata } from "next";
import { PostPropertyProvider } from "@/context/post-property-context";

export const metadata: Metadata = {
  title: "Khabiteq | Update Property - Joint Venture",
  description: `Update your property for joint venture on Khabi-Teq's trusted platform. Simplifying real estate transactions in Lagos.`,
  icons: {
    icon: "/khabi-teq.svg",
  },
};

export default function UpdateJointVentureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PostPropertyProvider>{children}</PostPropertyProvider>;
}
