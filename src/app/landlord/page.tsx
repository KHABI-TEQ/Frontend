/** @format */
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserContext } from "@/context/user-context";

export default function LandlordPage() {
  const router = useRouter();
  const { user } = useUserContext();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [user, router]);

  return null;
}
