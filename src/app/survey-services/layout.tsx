import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Survey Services | Khabiteq",
  description:
    "Request plan verification or a site survey from a licensed surveyor through Khabiteq.",
};

export default function SurveyServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
