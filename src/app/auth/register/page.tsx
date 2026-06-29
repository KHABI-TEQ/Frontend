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
import { useUserContext, normalizeUser } from "@/context/user-context";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleOAuthConfig } from "@/context/google-oauth-context";
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

/** Only rendered when Google OAuth is configured; uses useGoogleLogin so must be inside GoogleOAuthProvider. */
function GoogleRegisterButton({
  userType,
  referralCode,
  setUser,
  setSocialProcessing,
  setOverlayMessage,
  router,
  isDisabled,
}: {
  userType: string;
  referralCode: string;
  setUser: (u: any) => void;
  setSocialProcessing: (v: boolean) => void;
  setOverlayMessage: (m: string) => void;
  router: ReturnType<typeof useRouter>;
  isDisabled: boolean;
}) {
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse: any) => {
      if (!userType) {
        toast.error("Please select account type first.");
        return;
      }
      setOverlayMessage("Signing up with Google...");
      setSocialProcessing(true);
      try {
        const url = URLS.BASE + URLS.authGoogle;
        const response = await POST_REQUEST(url, {
          idToken: codeResponse.code,
          userType,
          ...(referralCode ? { referralCode } : {}),
        });
        if (response.success) {
          Cookies.set("token", (response.data as any).token);
          setUser(normalizeUser((response.data as any).user));
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
  return (
    <RegisterWith
      icon={googleIcon}
      text="Continue with Google"
      onClick={googleLogin}
      isDisabled={isDisabled}
    />
  );
}

const Register = () => {
  const isLoading = useLoading();
  const { user, setUser, isInitialized } = useUserContext();
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

  // Redirect authenticated users to dashboard (only after user context is initialized)
  useEffect(() => {
    if (isInitialized && user) {
      router.replace("/dashboard");
    }
  }, [user, isInitialized, router]);

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
    setIsSuccess(false);
    try {
      const url = URLS.BASE + URLS.authRegister;

      await toast.promise(
        (async () => {
          const response = await POST_REQUEST(url, {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            userType: values.userType,
            phoneNumber: String(values.phone),
            address: { state: "", city: "", street: "" },
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
            const res = response as any;
            if (process.env.NODE_ENV === "development") {
              console.warn("Registration API error (full response):", JSON.stringify(res, null, 2));
            }
            const parts: string[] = [];
            if (res.message) parts.push(res.message);
            if (res.error && res.error !== res.message) parts.push(res.error);
            if (res.data?.message) parts.push(res.data.message);
            if (res.data?.error && res.data.error !== res.data?.message) parts.push(res.data.error);
            const errList = res.errors ?? res.data?.errors;
            if (Array.isArray(errList) && errList.length > 0) {
              const msgs = errList.map((e: any) => e.msg ?? e.message ?? (typeof e === "string" ? e : e.error)).filter(Boolean);
              if (msgs.length) parts.push(msgs.join(". "));
            } else if (errList && typeof errList === "object" && !Array.isArray(errList)) {
              const flat = Object.entries(errList).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ");
              if (flat) parts.push(flat);
            }
            let fullMsg = parts.length ? parts.join(" — ") : "Registration failed.";
            const isGenericValidationError = fullMsg === "Validation error" || (fullMsg === "Validation error — Validation error");
            if (isGenericValidationError && values.userType === "Developer") {
              fullMsg = "Developer registration isn’t supported by the server yet. Please register as Landlord or Agent, or contact support to enable Developer accounts.";
            }
            throw new Error(fullMsg);
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
    } finally {
      setIsDisabled(false);
      setIsSuccess(false);
    }
  },
});

  const { isConfigured: googleOAuthConfigured } = useGoogleOAuthConfig();

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
                    setUser(normalizeUser((result.data as any).user));

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
      className={`min-h-screen w-full bg-[#F8FAF8] flex ${
        isContactUsClicked && "filter brightness-[30%]"
      } transition-all duration-500`}
    >
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A3E72] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#8DDB90]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-[#8DDB90] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#09391C]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-white font-display font-bold text-xl">Khabiteq</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight">
              Start Your Real Estate Journey Today
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              Create your account to list, buy, rent, or invest on a trusted Nigerian real estate platform.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Free to get started</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Verified properties & agents</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Secure transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
        <form
          onSubmit={formik.handleSubmit}
          className="w-full max-w-lg flex flex-col gap-5"
        >
          {/* Header */}
          <div className="text-center lg:text-left mb-2">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#09391C] mb-2">
              Create Your Account
            </h2>
            <p className="text-[#5A5D63] text-sm sm:text-base">
              Join Khabiteq and unlock access to verified properties
            </p>
          </div>

          {/* Account Type Selection */}
          <div className="w-full flex flex-col gap-3">
            <label className="text-sm font-semibold text-[#09391C]">
              I want to join as a...
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:items-stretch">
              {/* Landlord Radio Button */}
              <label className="relative flex h-full min-h-0 cursor-pointer flex-col group">
                <input
                  type="radio"
                  name="userType"
                  value="Landowners"
                  checked={formik.values.userType === "Landowners"}
                  onChange={formik.handleChange}
                  disabled={isDisabled}
                  className="sr-only peer"
                />
                <div className="flex h-full min-h-0 flex-1 flex-col bg-white border-2 border-gray-100 rounded-xl p-4 transition-all duration-300 hover:border-[#8DDB90]/50 hover:shadow-md peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90]/5 peer-checked:shadow-md peer-disabled:opacity-50">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="w-10 h-10 bg-[#8DDB90]/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#09391C]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-[#09391C]">Landlord</span>
                      <span className="block text-xs text-[#5A5D63]">List & sell properties</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </label>

              {/* Agent Radio Button */}
              <label className="relative flex h-full min-h-0 cursor-pointer flex-col group">
                <input
                  type="radio"
                  name="userType"
                  value="Agent"
                  checked={formik.values.userType === "Agent"}
                  onChange={formik.handleChange}
                  disabled={isDisabled}
                  className="sr-only peer"
                />
                <div className="flex h-full min-h-0 flex-1 flex-col bg-white border-2 border-gray-100 rounded-xl p-4 transition-all duration-300 hover:border-[#8DDB90]/50 hover:shadow-md peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90]/5 peer-checked:shadow-md peer-disabled:opacity-50">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="w-10 h-10 bg-[#8DDB90]/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#09391C]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-[#09391C]">Agent</span>
                      <span className="block text-xs text-[#5A5D63]">Help clients buy/sell</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </label>

              {/* Developer Radio Button */}
              <label className="relative flex h-full min-h-0 cursor-pointer flex-col group">
                <input
                  type="radio"
                  name="userType"
                  value="Developer"
                  checked={formik.values.userType === "Developer"}
                  onChange={formik.handleChange}
                  disabled={isDisabled}
                  className="sr-only peer"
                />
                <div className="flex h-full min-h-0 flex-1 flex-col bg-white border-2 border-gray-100 rounded-xl p-4 transition-all duration-300 hover:border-[#8DDB90]/50 hover:shadow-md peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90]/5 peer-checked:shadow-md peer-disabled:opacity-50">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="w-10 h-10 bg-[#8DDB90]/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#09391C]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-[#09391C]">Developer</span>
                      <span className="block text-xs text-[#5A5D63]">Showcase projects</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
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
            <div className="w-full">
              <div className="relative w-full mb-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#F8FAF8] px-3 text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {googleOAuthConfigured ? (
                  <GoogleRegisterButton
                    userType={formik.values.userType}
                    referralCode={formik.values.referralCode ?? ""}
                    setUser={setUser}
                    setSocialProcessing={setSocialProcessing}
                    setOverlayMessage={setOverlayMessage}
                    router={router}
                    isDisabled={isDisabled || socialProcessing}
                  />
                ) : (
                  <RegisterWith
                    icon={googleIcon}
                    text="Google"
                    onClick={() => toast.error("Google sign-in is not configured for this environment.")}
                    isDisabled={true}
                  />
                )}
                <RegisterWith
                  icon={facebookIcon}
                  text="Facebook"
                  onClick={handleFacebookSignup}
                  isDisabled={isDisabled || socialProcessing}
                />
              </div>

              <div className="mt-5 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#F8FAF8] px-3 text-gray-400 text-xs">
                    Or fill in your details
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Inputs */}
          <div className="w-full flex flex-col gap-4">
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
          <div className="w-full">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => !isDisabled && setAgreed(!agreed)}
                disabled={isDisabled}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded-md bg-white transition-all duration-200 peer-checked:border-[#8DDB90] peer-checked:bg-[#8DDB90] peer-disabled:opacity-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-sm text-gray-600 leading-relaxed">
                I agree to the Khabi-Teq{" "}
                <Link href="/policies_page" className="text-[#09391C] font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/policies_page" className="text-[#09391C] font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            value={isDisabled ? "Creating account..." : isSuccess ? "Success!" : "Create Account"}
            isDisabled={
              isDisabled ||
              isSuccess ||
              !agreed ||
              !formik.values.email ||
              !formik.values.password ||
              !formik.values.confirmPassword ||
              !formik.values.firstName ||
              !formik.values.lastName ||
              !formik.values.phone ||
              !formik.values.userType ||
              (formik.submitCount > 0 && !formik.isValid)
            }
            className="min-h-[52px] w-full rounded-xl bg-[#09391C] text-white text-base font-semibold hover:bg-[#0B423D] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            type="submit"
            green={false}
          />

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-[#09391C] hover:underline">
              Sign in
            </Link>
          </p>

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
