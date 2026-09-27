"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SurveyorJobRedirect() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const id = params?.id ? String(params.id) : "";
    router.replace(id ? `/dashboard?section=briefs&brief=${id}` : "/dashboard?section=briefs");
  }, [params, router]);

  return <p className="px-4 py-16 text-center text-sm text-[#5A5D63]">Opening this brief…</p>;
}
