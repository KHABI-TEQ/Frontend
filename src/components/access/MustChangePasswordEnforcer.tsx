"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserContext, userMustChangePassword } from "@/context/user-context";

const ALLOWED_PATH_PREFIXES = ["/auth/change-password"];

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * When the server marks the account with mustChangePassword, keep the user on
 * the forced change-password flow until the flag clears (except sign-out via logout).
 */
export default function MustChangePasswordEnforcer() {
  const { user, isInitialized, isLoading } = useUserContext();
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!user || !userMustChangePassword(user)) return;
    if (isAllowedPath(pathname)) return;
    router.replace("/auth/change-password");
  }, [user, isInitialized, isLoading, pathname, router]);

  return null;
}
