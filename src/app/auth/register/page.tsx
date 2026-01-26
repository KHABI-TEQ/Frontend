/**
 * @format
 */
/* eslint-disable @typescript-eslint/no-explicit-any */ // Consider removing or narrowing this as you refine types
"use client";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import React, { FC, Suspense, useEffect, useState, useCallback } from "react";
import mailIcon from "@/svgs/envelope.svg";
import phoneIcon from "@/svgs/phone.svg";
import * as Yup from "yup";
import { useFormik } from "formik";
import Button from "@/components/general-components/button";
import { RegisterWith } from "@/components/general-components/registerWith";
import googleIcon from "@/svgs/googleIcon.svg";
import facebookIcon from "@/svgs/facebookIcon.svg";
import Link from "next/link";
import { usePageContext } from "@/context/page-context";
import { useUserContext } from "@/context/user-context";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useGoogleLogin } from "@react-oauth/google";
import CustomToast from "@/components/general-components/CustomToast";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
// The InputField component from common/ should be used, not a local one
import InputField from "@/components/common/InputField"; // Ensure this import path is correct

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const Register = () => {
  const isLoading = useLoading();
  const { setUser } = useUserContext(); // Removed 'user' as it's not directly used here
  const { isContactUsClicked } = usePageContext();
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralFromUrl = (searchParams.get("ref") || searchParams.get("referral") || "").trim();
  const fromParam = searchParams.get('from');
  const [agreed, setAgreed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [socialProcessing, setSocialProcessing] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState<string>("");

  // Memoized callback for password toggle (for InputField)
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Memoized callback for confirm password toggle (for InputField)
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Enter email"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(
        /^(?=(?:.*[\W_]){2,}).*$/,
        "Password must contain at least two special characters",
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm password is required"),
    firstName: Yup.string()
      .matches(/^[a-zA-Z]+$/, "First name must only contain letters")
      .required("First name is required"),
    lastName: Yup.string()
      .matches(/^[a-zA-Z]+$/, "Last name must only contain letters")
      .required("Last name is required"),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must only contain digits")
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 digits")
      .required("Phone number is required"),
    userType: Yup.string().required("Please select account type"),
    referralCode: Yup.string().optional(),
  });

  const formik = useFormik({
  initialValues: {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    confirmPassword: "",
    userType: "",
    referralCode: referralFromUrl,
  },
  enableReinitialize: true,
  validationSchema,
  onSubmit: async (values) => {
    setIsDisabled(true);
    try {
      const url = URLS.BASE + URLS.authRegister;

      await toast.promise(
        (async () => {
          const { phone, confirmPassword, ...payload } = values;

          const response = await POST_REQUEST(url, {
            ...payload,
            phoneNumber: String(values.phone),
            userType: values.userType,
            ...(values.referralCode ? { referralCode: values.referralCode } : {}),
          });

          if (response.success) {
            localStorage.setItem(
              "fullname",
              `${formik.values.firstName} ${formik.values.lastName}`
            );
            localStorage.setItem("email", `${formik.values.email}`);
            localStorage.setItem("userType", `${formik.values.userType}`);

            setIsSuccess(true);
            formik.resetForm();
            setAgreed(false);

            setOverlayVisible(true);
            setTimeout(() => {
              setOverlayVisible(false);
              toast.custom(
                <CustomToast
                  title="Registration successful"
                  subtitle="A verification email has been sent to your email. Please verify your email to continue."
                />
              );
              router.push(fromParam ? `/auth/verification-sent?from=${encodeURIComponent(fromParam)}` : "/auth/verification-sent");
            }, 2000);

            return "Registration successful";
          } else {
            throw new Error(response.error || "Registration failed");
          }
        })(),
        {
          loading: "Signing up...",
          success: "Registration successful",
          error: (err) => err.message || "Registration failed",
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      setIsDisabled(false);
      setIsSuccess(false);
    }
  },
});

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse: any) => {
      if (!formik.values.userType) {
        toast.error("Please select account type first.");
        return;
      }

      setOverlayMessage("Signing up with Google...");
      setSocialProcessing(true);
      try {
        const url = URLS.BASE + URLS.authGoogle;
        const response = await POST_REQUEST(url, {
          idToken: codeResponse.code,
          userType: formik.values.userType,
          ...(formik.values.referralCode ? { referralCode: formik.values.referralCode } : {}),
        });

        if (response.success) {
          Cookies.set("token", (response.data as any).token);
          setUser((response.data as any).user);

          toast.success("Authentication successful via Google!");

          setSocialProcessing(false);
          router.push("/dashboard");

        } else if (response.error) {
          toast.error(response.error);
        } else {
          toast.error("Google authentication failed. Please try again.");
        }


      } catch (error: any) {
        console.error("Google signup error:", error);
        toast.error(error.message || "Google registration failed!");
      } finally {
        setSocialProcessing(false);
      }
    },
    onError: (errorResponse: any) => toast.error(errorResponse.message || "Google sign-up was cancelled or failed."),
  });

  // Initialize Facebook SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "0000000000000000", // Disabled if no app ID
        cookie: true,
        xfbml: true,
        version: "v21.0",
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleFacebookSignup = () => {
    if (!formik.values.userType) {
      toast.error("Please select account type first.");
      return;
    }

    if (typeof window !== "undefined" && window.FB) { 
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            window.FB.api(
              "/me",
              { fields: "name,email,first_name,last_name" },
              async (userInfo: any) => {
                try {
                  const url = URLS.BASE + URLS.authFacebook;
                  const payload = {
                    idToken: response.authResponse.accessToken,
                    userType: formik.values.userType,
                    ...(formik.values.referralCode ? { referralCode: formik.values.referralCode } : {}),
                  };

                  setOverlayMessage("Signing up with Facebook...");
                  setSocialProcessing(true);
                  const result = await POST_REQUEST(url, payload);

                  if (result.success) {
                    Cookies.set("token", (result.data as any).token);
                    setUser((result.data as any).user);

                    toast.success("Authentication successful via Facebook!");
 
                    setSocialProcessing(false);
                    router.push("/dashboard");

                  } else if (response.error) {
                    toast.error(response.error);
                  } else {
                    toast.error("Facebook authentication failed. Please try again.");
                  }
                } catch (error: any) {
                  console.error("Facebook signup error:", error);
                  toast.error(error.message || "Facebook registration failed, please try again!");
                } finally {
                  setSocialProcessing(false);
                }
              },
            );
          } else {
            toast.error("Facebook login was cancelled.");
          }
        },
        { scope: "email,public_profile" },
      );
    } else {
      toast.error("Facebook SDK not loaded. Please try again in a moment.");
    }
  };

  if (isLoading) return <Loading />;

  return (
    <section
      className={`flex items-center justify-center bg-[#EEF1F1] w-full ${
        isContactUsClicked && "filter brightness-[30%]"
      } transition-all duration-500`}
    >
      <div className="container flex items-center justify-center py-[20px] md:py-[30px] md:mt-[60px] px-[25px] lg:px-0">
        <form
          onSubmit={formik.handleSubmit}
          className="lg:w-[700px] w-full min-h-[700px] flex flex-col items-center gap-[20px]"
        >
          <h2 className="text-3xl md:text-[24px] font-display leading-[38.4px] font-semibold text-[#09391C]">
            Register with us
          </h2>

          {/* Account Type Selection */}
          <div className="w-full flex flex-col gap-[15px] lg:px-[60px]">
            <span className="text-base leading-[25.6px] font-medium text-[#1E1E1E]">
              Are you a Landlord or Agent?
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              {/* Landlord Radio Button */}
              <label className="relative cursor-pointer group h-full">
                <input
                  type="radio"
                  name="userType"
                  value="Landowners"
                  checked={formik.values.userType === "Landowners"}
                  onChange={formik.handleChange}
                  disabled={isDisabled}
                  className="sr-only peer"
                />
                <div className="bg-white h-full border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#8DDB90] hover:shadow-lg hover:transform hover:scale-[1.02] peer-checked:border-[#8DDB90] peer-checked:bg-gradient-to-br peer-checked:from-[#8DDB90]/10 peer-checked:to-[#8DDB90]/5 peer-checked:shadow-lg peer-checked:transform peer-checked:scale-[1.02] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex gap-2 items-center">
                          <div className="w-8 h-8 bg-[#8DDB90]/20 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-[#09391C]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold text-[#09391C]">
                            Landlord
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 transition-all duration-300 flex items-center justify-center peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90] peer-checked:shadow-sm">
                            <div className="w-3 h-3 rounded-full bg-white opacity-0 transition-all duration-300 peer-checked:opacity-100 scale-0 peer-checked:scale-100"></div>
                          </div>
                          <div className="absolute inset-0 w-6 h-6 rounded-full bg-[#8DDB90] opacity-0 transition-all duration-300 peer-checked:opacity-20 animate-pulse"></div>
                        </div>
                      </div>
                      <span className="text-sm text-[#5A5D63] leading-relaxed">
                        Property owner looking to sell or rent
                      </span>
                    </div>
                  </div>
                </div>
              </label>

              {/* Agent Radio Button */}
              <label className="relative cursor-pointer group h-full">
                <input
                  type="radio"
                  name="userType"
                  value="Agent"
                  checked={formik.values.userType === "Agent"}
                  onChange={formik.handleChange}
                  disabled={isDisabled}
                  className="sr-only peer"
                />
                <div className="bg-white h-full border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#8DDB90] hover:shadow-lg hover:transform hover:scale-[1.02] peer-checked:border-[#8DDB90] peer-checked:bg-gradient-to-br peer-checked:from-[#8DDB90]/10 peer-checked:to-[#8DDB90]/5 peer-checked:shadow-lg peer-checked:transform peer-checked:scale-[1.02] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex gap-2 items-center">
                          <div className="w-8 h-8 bg-[#8DDB90]/20 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-[#09391C]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold text-[#09391C]">
                            Agent
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 transition-all duration-300 flex items-center justify-center peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90] peer-checked:shadow-sm">
                            <div className="w-3 h-3 rounded-full bg-white opacity-0 transition-all duration-300 peer-checked:opacity-100 scale-0 peer-checked:scale-100"></div>
                          </div>
                          <div className="absolute inset-0 w-6 h-6 rounded-full bg-[#8DDB90] opacity-0 transition-all duration-300 peer-checked:opacity-20 animate-pulse"></div>
                        </div>
                      </div>
                      <span className="text-sm text-[#5A5D63] leading-relaxed">
                        Assisting clients with property buying and selling.
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {formik.touched.userType && formik.errors.userType && (
              <span className="text-red-600 text-sm">
                {formik.errors.userType}
              </span>
            )}
          </div>

          {/* Social Login Section - Show only when userType is selected */}
          {formik.values.userType && (
            <div className="w-full lg:px-[60px] mt-4"> {/* Added mt-4 for spacing */}
              <div className="relative w-full mb-4"> {/* Added mb-4 for spacing */}
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#EEF1F1] font-bold px-2 text-gray-500">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-[15px]">
                <RegisterWith
                  icon={googleIcon}
                  text="Continue with Google"
                  onClick={googleLogin}
                  isDisabled={isDisabled || socialProcessing}
                />
                <RegisterWith
                  icon={facebookIcon}
                  text="Continue with Facebook"
                  onClick={handleFacebookSignup}
                  isDisabled={isDisabled || socialProcessing}
                />
              </div>

              <div className="mt-6 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>

            </div>
          )}

          {/* Form Inputs (using InputField component) */}
          <div className="w-full min-h-[460px] flex flex-col gap-[15px] lg:px-[60px]">
            <div className="flex flex-col lg:flex-row gap-[15px] w-full">
              <InputField
                formik={formik}
                label="First name"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                className="w-full"
              />
              <InputField
                formik={formik}
                label="Last name"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                className="w-full"
              />
            </div>
            <InputField
              formik={formik}
              label="Phone"
              name="phone"
              icon={phoneIcon}
              type="number"
              placeholder="Enter your phone number"
            />
            <InputField
              formik={formik}
              label="Email"
              name="email"
              icon={mailIcon}
              type="email"
              placeholder="Enter your email"
            />
            <InputField
              formik={formik}
              label="Referral code (optional)"
              name="referralCode"
              type="text"
              placeholder="Enter referral code"
            />
            <InputField
              formik={formik}
              label="Password"
              name="password"
              type="password" // Always pass 'password' type to InputField for internal handling
              placeholder="Enter your password"
              showPasswordToggle={true}
              isPasswordVisible={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
            />
            <InputField
              formik={formik}
              label="Confirm Password"
              name="confirmPassword"
              type="password" // Always pass 'password' type to InputField for internal handling
              placeholder="Confirm your password"
              showPasswordToggle={true}
              isPasswordVisible={showConfirmPassword}
              togglePasswordVisibility={toggleConfirmPasswordVisibility}
            />
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex justify-center items-center w-full lg:px-[60px]">
            <div className="flex items-start gap-3 w-full">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={() => !isDisabled && setAgreed(!agreed)}
                  disabled={isDisabled}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white transition-all duration-300 peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </label>
              <div className="flex-1 text-sm text-gray-600 leading-relaxed">
                By clicking here, I agree to the Khabi-Teq realty{" "}
                <a
                  href="/policies_page"
                  className="text-[#0B423D] font-bold hover:underline"
                >
                  Policy and Rules
                </a>
              </div>
            </div>
          </div>
            {/**Button */}
            <div className="lg:px-[60px] w-full">
              <Button
                value={`${
                  isDisabled
                    ? "Registering..."
                    : isSuccess
                      ? "Registration Successful!"
                      : "Register"
                }`}
                isDisabled={
                  isDisabled ||
                  isSuccess ||
                  !agreed ||
                  // Ensure all required fields from initialValues are checked for form validity
                  !formik.values.email ||
                  !formik.values.password ||
                  !formik.values.confirmPassword || // Check confirmPassword
                  !formik.values.firstName ||
                  !formik.values.lastName ||
                  !formik.values.phone ||
                  !formik.values.userType ||
                  // Also consider if formik.isValid should be part of this check
                  (formik.submitCount > 0 && !formik.isValid) // Prevent submission if form is invalid after first attempt
                }
                className="min-h-[60px] w-full rounded-md py-[12px] duration-300 transition ease-in-out px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold mt-6"
                type="submit"
                green={true}
              />
            </div>
            {/**Already have an account */}
            <span className="text-base leading-[25.6px] font-normal">
              Already have an account?{" "}
              <Link className="font-semibold text-[#09391C]" href={"/auth/login"}>
                Sign In
              </Link>
            </span>

        </form>
      </div>
      <OverlayPreloader
        isVisible={overlayVisible || socialProcessing}
        message={
          socialProcessing
            ? overlayMessage || "Processing..."
            : isSuccess
              ? formik.values.userType === "Agent"
                ? "Sending verification email..."
                : "Setting up your account..."
              : "Processing registration..."
        }
      />
    </section>
  );
};

// Removed the local 'Input' component entirely, as 'InputField' from common is now used.

export default function RegisterPage() {
  return (
    <Suspense>
      <Register />
    </Suspense>
  );
}
