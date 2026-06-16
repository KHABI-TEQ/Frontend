/** @format */

import type { Metadata } from "next";
import { PostPropertyProvider } from "@/context/post-property-context";

export const metadata: Metadata = {
  title: "Khabiteq | Update Property - Off-Plan",
  description: "Update your off-plan property listing on Khabi-Teq.",
  icons: {
    icon: "/khabiteq_logo_nobg.png",
  },
};

export default function UpdateOffPlanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PostPropertyProvider>{children}</PostPropertyProvider>;
}
