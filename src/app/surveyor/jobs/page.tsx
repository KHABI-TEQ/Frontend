"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SurveyorJobsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard?section=briefs");
  }, [router]);
  return <p className="px-4 py-16 text-center text-sm text-[#5A5D63]">Opening Service briefs…</p>;
}
