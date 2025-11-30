/**
 * @format
 */

"use client";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import React, { useEffect, useState } from "react";
import Button from "@/components/general-components/button";
import Link from "next/link";
import { usePageContext } from "@/context/page-context";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const VerificationSent = () => {
  const isLoading = useLoading();
  const { isContactUsClicked } = usePageContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"Agent" | "Landowners" | null>(null);
  const [isResending, setIsResending] = useState(false);

  const isAgent = userType === "Agent";
  const isLandowner = userType === "Landowners";

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    const storedUserType = localStorage.getItem("userType");
    if (!userEmail) {
      router.push("/auth/register");
      return;
    }
    setEmail(userEmail);
    setUserType((storedUserType as "Agent" | "Landowners") || "Landowners");
  }, [router]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const url = URLS.BASE + URLS.authResendVerficationToken;

      await toast.promise(
        POST_REQUEST(url, { email }).then((response) => {
          if (response.success) {
            return "Verification email sent again";
          } else {
            throw new Error(response.error || "An error occurred");
          }
        }),
        {
          loading: "Resending verification...",
          success: "Verification email sent again",
          error: (error: { message: any }) => {
            return error.message || "Failed to resend verification";
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
      className={`flex items-center justify-center bg-[#EEF1F1] w-full min-h-screen ${
        isContactUsClicked && "filter brightness-[30%]"
      } transition-all duration-500`}
    >
      <div className="container flex items-center justify-center py-[30px] px-[25px] lg:px-0">
        <div className="lg:w-[600px] w-full flex flex-col items-center gap-[30px] text-center">
          
          {/* Header Section */}
          <div className="flex flex-col items-center gap-[20px]">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-[#8DDB90] rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-[32px] lg:text-[28px] font-display leading-[38.4px] font-semibold text-[#09391C]">
              {isAgent ? "Agent Registration Verification" : "Account Registration Verification"}
            </h2>
          </div>

          {/* Content Section */}
          <div className="max-w-[500px] space-y-[20px]">
            <p className="text-[18px] leading-[28px] font-medium text-[#09391C]">
              {isAgent
                ? "Congratulations! Your agent registration was successful."
                : "Congratulations! Your account registration was successful."
              }
            </p>

            <p className="text-[16px] leading-[25.6px] text-[#1E1E1E]">
              We've sent a verification email to{" "}
              <span className="font-semibold text-[#09391C]">{email}</span>.
              Please check your email and click the verification link to
              activate your account.
            </p>

            <p className="text-[14px] leading-[22px] text-[#5A5D63]">
              {isAgent
                ? "Once verified, you'll need to complete your KYC (Know Your Customer) verification before you can start posting properties and connecting with clients."
                : "Once verified, you can immediately start browsing properties and listing your properties on our platform."
              }
            </p>
          </div>

          {/* Instructions Card */}
          <div className="bg-white border-2 border-[#8DDB90] rounded-xl p-[24px] max-w-[480px] w-full">
            <h3 className="font-display font-semibold text-[18px] leading-[28px] text-[#09391C] mb-[16px]">
              What's Next?
            </h3>
            <ul className="text-[14px] leading-[22px] text-[#1E1E1E] space-y-[8px] text-left">
              <li className="flex items-start gap-[8px]">
                <span className="text-[#8DDB90] font-bold mt-[2px]">•</span>
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#8DDB90] font-bold mt-[2px]">•</span>
                <span>Click the verification link in the email</span>
              </li>
              {isAgent ? (
                <>
                  <li className="flex items-start gap-[8px]">
                    <span className="text-[#8DDB90] font-bold mt-[2px]">•</span>
                    <span>Complete your agent profile setup</span>
                  </li>
                  <li className="flex items-start gap-[8px]">
                    <span className="text-[#8DDB90] font-bold mt-[2px]">•</span>
                    <span>Submit KYC (Know Your Customer) verification</span>
                  </li>
                  <li className="flex items-start gap-[8px]">
                    <span className="text-[#8DDB90] font-bold mt-[2px]">•</span>
                    <span>Wait for approval and start browsing client briefs</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-[8px]">
                    <span className="text-[#8DDB90] font-bold mt-[2px]">•</span>
                    <span>Start using the platform immediately</span>
                  </li>
                  <li className="flex items-start gap-[8px]">
                    <span className="text-[#8DDB90] font-bold mt-[2px]">•</span>
                    <span>Browse and post properties without restrictions</span>
                  </li>
                  <li className="flex items-start gap-[8px]">
                    <span className="text-[#8DDB90] font-bold mt-[2px]">•</span>
                    <span>Complete your profile to improve visibility</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-[16px] w-full max-w-[480px]">
            <Button
              value={isResending ? "Resending..." : "Resend Verification Email"}
              className="min-h-[55px] w-full py-[12px] px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-[16px] leading-[25.6px] font-bold rounded-md transition-all duration-300"
              onClick={handleResendVerification}
              isDisabled={isResending}
              green={true}
            />

            <Button
              value="Back to Login"
              className="min-h-[55px] w-full py-[12px] px-[24px] bg-[#FAFAFA] border-2 border-[#D6DDEB] text-[#1E1E1E] text-[16px] leading-[25.6px] font-bold rounded-md transition-all duration-300 hover:border-[#8DDB90]"
              onClick={() => router.push("/auth/login")}
            />
          </div>

          {/* Additional Info Card for Agents */}
          {isAgent && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-[20px] max-w-[480px] w-full">
              <h4 className="font-semibold text-[14px] text-[#09391C] mb-[12px]">
                About KYC Verification
              </h4>
              <p className="text-[13px] leading-[20px] text-[#1E1E1E]">
                KYC verification is a required security step that helps us verify your identity. You'll need to provide valid identification documents. The process usually takes 24-48 hours for approval.
              </p>
            </div>
          )}

          {/* Footer Links */}
          <div className="flex flex-col items-center gap-[16px] text-center">
            <p className="text-[16px] leading-[25.6px] font-normal text-[#1E1E1E]">
              Already verified?{" "}
              <Link
                className="font-semibold text-[#09391C] hover:underline transition-all duration-300"
                href="/auth/login"
              >
                Sign in to your account
              </Link>
            </p>

            <div className="text-[14px] leading-[22px] text-[#5A5D63] max-w-[400px]">
              <p>
                <span className="font-semibold">Didn't receive the email?</span>{" "}
                Check your spam/junk folder or contact support if you continue to have
                issues.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VerificationSent;
