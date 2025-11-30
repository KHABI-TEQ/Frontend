/**
 * @format
 */

/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/general-components/button";
import Link from "next/link";
import { usePageContext } from "@/context/page-context";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const VerifyResetRequest = () => {
  const isLoading = useLoading();
  const { isContactUsClicked } = usePageContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const resetEmail = localStorage.getItem("resetEmail");
    if (!resetEmail) {
      router.push("/auth/forgot-password");
      return;
    }
    setEmail(resetEmail);
  }, [router]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const url = URLS.BASE + URLS.authVerifyPasswordResetCode;
      await toast.promise(
        POST_REQUEST(url, { email, token: verificationCode }).then((response) => {
          if (response.success) {
            // Save code & email if needed later
            localStorage.setItem("resetCode", verificationCode);
            localStorage.setItem("resetEmail", email);

            router.push("/auth/forgot-password/reset");
            return "Code verified! Please set your new password.";
          } else {
            throw new Error((response as any).error || "Invalid verification code");
          }
        }),
        {
          loading: "Verifying code...",
          success: "Code verified! Please set your new password.",
          error: (error: any) => error.message || "Failed to verify code",
        }
      );
    } catch (error) {
      console.log("Verification Error:", error);
    } finally {
      setIsVerifying(false);
    }
  };


  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const url = URLS.BASE + URLS.authResendResetPasswordToken;

      await toast.promise(
        POST_REQUEST(url, { email }).then((response) => {
          if (response.success) {
            return "6-digit reset code sent again";
          } else {
            throw new Error((response as any).error || "An error occurred");
          }
        }),
        {
          loading: "Resending code...",
          success: "6-digit reset code sent again",
          error: (error: { message: any }) => {
            return error.message || "Failed to resend code";
          },
        },
      );
    } catch (error) {
      console.log("Unexpected error:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <section
      className={`flex items-center justify-center bg-[#EEF1F1] w-full ${
        isContactUsClicked && "filter brightness-[30%]"
      } transition-all duration-500`}
    >
      <div className="container flex items-center justify-center py-[30px] mt-[60px] px-[25px] lg:px-0">
        <div className="lg:w-[600px] w-full min-h-[500px] flex flex-col items-center gap-[20px] text-center">
          <h2 className="text-[24px] font-display leading-[38.4px] font-semibold text-[#09391C]">
            Enter Verification Code
          </h2>
          <div className="w-16 h-16 bg-[#8DDB90] rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <p className="text-gray-600 max-w-md">
            We&apos;ve sent a 6-digit verification code to{" "}
            <strong>{email}</strong>. Enter the code below to reset your
            password.
          </p>

          {/* 6-digit code input */}
          <div className="flex justify-center gap-2 mt-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleCodeChange(index, e.target.value.replace(/[^0-9]/g, ""))
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg text-lg font-semibold focus:border-[#8DDB90] focus:outline-none transition-colors"
                disabled={isVerifying}
              />
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Didn&apos;t receive the code? Check your spam folder or try
            resending.
          </p>

          <div className="flex flex-col gap-4 w-full lg:px-[60px] mt-6">
            <Button
              value={isVerifying ? "Verifying..." : "Verify Code"}
              className="min-h-[50px] w-full rounded-md py-[12px] px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold"
              onClick={handleVerifyCode}
              isDisabled={isVerifying || code.join("").length !== 6}
              green={true}
            />

            <Button
              value={isResending ? "Resending..." : "Resend Code"}
              className="min-h-[60px] w-full rounded-md py-[12px] px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold"
              onClick={handleResendEmail}
              isDisabled={isResending}
              green={true}
            />

          </div>

          <p className="text-base leading-[25.6px] font-normal">
            Remember your password?{" "}
            <Link className="font-semibold text-[#09391C]" href="/auth/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default VerifyResetRequest;
