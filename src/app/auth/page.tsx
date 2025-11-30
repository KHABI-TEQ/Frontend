/**
 * @format
 */

"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to register page as the default auth action
    router.replace("/auth/login");
  }, [router]);

  return null;
}
