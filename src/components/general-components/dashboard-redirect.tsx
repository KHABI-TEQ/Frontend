/** @format */

"use client";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/user-context";
import { useEffect } from "react";

interface DashboardRedirectProps {
  children: React.ReactNode;
}

const DashboardRedirect: React.FC<DashboardRedirectProps> = ({ children }) => {
  const { user } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Auto-redirect based on user type if on general dashboard
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/dashboard"
    ) {
      if (user.userType === "Landowners") {
        router.replace("/dashboard");
      } else if (user.userType === "Agent") {
        router.replace("/dashboard");
      }
    }
  }, [user, router]);

  return <>{children}</>;
};

export default DashboardRedirect;
