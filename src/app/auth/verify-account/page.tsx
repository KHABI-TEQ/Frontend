"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

type VerificationStatus = "loading" | "success" | "error" | "invalid";

interface VerificationResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// This is the core logic component that uses useSearchParams
const VerifyAccountComponent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook requires Suspense
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    const token = searchParams?.get("token");

    if (!token) {
      setStatus("invalid");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyAccount(token);
  }, [searchParams]); // Depend on searchParams to re-run if it changes (e.g., during hydration)

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      router.push("/auth/login");
    }
  }, [status, countdown, router]);

  const verifyAccount = async (token: string) => {
    try {
      const url = `${URLS.BASE}${URLS.authVerifyAccount}?token=${token}`;
      const response: VerificationResponse = await GET_REQUEST(url);

      if (response.success) {
        setStatus("success");
        setMessage(response.message || "Account verified successfully!");
      } else {
        setStatus("error");
        setMessage(
          response.message || "Verification failed. Please try again.",
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("An error occurred during verification. Please try again.");
    }
  };

  const handleReturnToLogin = () => {
    router.push("/auth/login");
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const iconVariants = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4EFE7] via-white to-[#F0F9F1] flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center"
      >
        {/* Status Icon */}
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          {status === "loading" && (
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-[#8DDB90] animate-spin" />
            </div>
          )}

          {status === "success" && (
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          )}

          {(status === "error" || status === "invalid") && (
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {status === "loading" && (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Verifying Your Account
              </h1>
              <p className="text-gray-600 mb-6">
                Please wait while we verify your account...
              </p>
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 bg-[#8DDB90] rounded-full"
                  />
                ))}
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Account Verified!
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 text-sm">
                  Redirecting to login in{" "}
                  <span className="font-bold">{countdown}</span> seconds...
                </p>
              </div>
              <button
                onClick={handleReturnToLogin}
                className="w-full bg-[#8DDB90] hover:bg-[#76c77a] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Continue to Login
              </button>
            </>
          )}

          {(status === "error" || status === "invalid") && (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-red-700 text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>
                    Please check your email for a new verification link or
                    contact support.
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleReturnToLogin}
                  className="w-full bg-[#8DDB90] hover:bg-[#76c77a] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200"
                >
                  Create New Account
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <p className="text-xs text-gray-500">
            Having trouble?{" "}
            <span className="text-[#8DDB90] hover:underline cursor-pointer">
              Contact support
            </span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

// This is the page component that wraps VerifyAccountComponent in Suspense
const VerifyAccountPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-16 h-16 text-[#8DDB90] animate-spin" />
          <p className="text-gray-600 ml-4 text-lg">Loading verification...</p>
        </div>
      }
    >
      <VerifyAccountComponent />
    </Suspense>
  );
};

export default VerifyAccountPage;