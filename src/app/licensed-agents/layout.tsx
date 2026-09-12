import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licensed Professionals | Khabiteq",
  description:
    "Browse verified real estate professionals and open their public pages to view listings and request inspections.",
};

export default function LicensedAgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
