/**
 * @format
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import Button from "@/components/general-components/button";
import InputField from "@/components/common/InputField";
import Loading from "@/components/loading-component/loading";
import { useUserContext, userMustChangePassword, normalizeUser } from "@/context/user-context";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

/** Same-origin path only — avoids open redirects from sessionStorage. */
function safePostLoginPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

function navigateAfterPasswordChange(path: string): void {
  if (typeof window === "undefined") return;
  window.location.assign(path);
}

export default function ForceChangePasswordPage() {
  const { user, setUser, logout, isLoading, isInitialized } = useUserContext();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (!userMustChangePassword(user)) {
      const pending =
        typeof window !== "undefined" ? sessionStorage.getItem("redirectAfterLogin") : null;
      if (pending) {
        try {
          sessionStorage.removeItem("redirectAfterLogin");
        } catch {}
        navigateAfterPasswordChange(safePostLoginPath(pending));
        return;
      }
      navigateAfterPasswordChange("/dashboard");
    }
  }, [user, isInitialized, isLoading, router]);

  const validationSchema = Yup.object({
    oldPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("New password is required"),
  });

  const onSubmit = useCallback(
    async (values: { oldPassword: string; newPassword: string }) => {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("You are not signed in.");
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await PUT_REQUEST(
          URLS.BASE + URLS.accountSettingsBaseUrl + "/changePassword",
          {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          },
          token,
        );
        if (response.success) {
          toast.success(
            (response as any).message || "Password changed successfully",
          );
          if (user) {
            setUser(
              normalizeUser({
                ...user,
                mustChangePassword: false,
              }),
            );
          }
          // Redirect runs once in useEffect after `mustChangePassword` clears (full page
          // navigation there avoids a long stuck <Loading /> during slow /dashboard compile).
        } else {
          toast.error(
            (response as any).error ||
              (response as any).message ||
              "Failed to change password",
          );
        }
      } catch {
        toast.error("Failed to change password. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [setUser, user],
  );

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
    },
    validationSchema,
    onSubmit,
  });

  if (!isInitialized || isLoading || !user) {
    return <Loading />;
  }

  if (!userMustChangePassword(user)) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8FAF8] p-8 text-center">
        <Loading />
        <p className="max-w-sm text-sm text-[#5A5D63]">
          Password updated. Taking you to your dashboard… If this screen stays up, refresh the page
          or use the menu to continue.
        </p>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full bg-[#F8FAF8] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md rounded-2xl border border-[#D6DDEB] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-[#09391C]">
            Update your password
          </h1>
          <p className="mt-2 text-sm text-[#5A5D63]">
            An administrator created your account. Choose a new password to continue
            using Khabiteq.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <InputField
            formik={formik}
            label="Current password"
            name="oldPassword"
            type="password"
            placeholder="Enter your current password"
            showPasswordToggle
            isPasswordVisible={showPassword}
            togglePasswordVisibility={() => setShowPassword((v) => !v)}
          />
          <InputField
            formik={formik}
            label="New password"
            name="newPassword"
            type="password"
            placeholder="At least 8 characters"
            showPasswordToggle
            isPasswordVisible={showNewPassword}
            togglePasswordVisibility={() => setShowNewPassword((v) => !v)}
          />

          <Button
            value={isSubmitting ? "Saving..." : "Save new password"}
            className="mt-2 min-h-[52px] w-full rounded-xl bg-[#09391C] text-base font-semibold text-white transition-all hover:bg-[#0B423D]"
            type="submit"
            isDisabled={isSubmitting}
            onSubmit={formik.handleSubmit}
            green={false}
          />
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <button
            type="button"
            className="text-sm font-medium text-[#5A5D63] underline decoration-[#09391C]/30 underline-offset-2 hover:text-[#09391C]"
            onClick={() => logout()}
          >
            Sign out instead
          </button>
        </div>

      </div>
    </section>
  );
}
