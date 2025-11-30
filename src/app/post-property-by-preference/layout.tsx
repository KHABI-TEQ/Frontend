import type { Metadata } from "next";
import { PostPropertyProvider } from "@/context/post-property-context";

export const metadata: Metadata = {
  title: "Post Property by Preference | Khabi Teq",
  description: "Submit property listings that match buyer preferences",
};

export default function PostPropertyByPreferenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PostPropertyProvider>{children}</PostPropertyProvider>;
}
