/**
 * @format
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { FC, useEffect, useState, useCallback, useMemo } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

// Components
import Loading from "@/components/loading-component/loading";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
import Button from "@/components/general-components/button";
import { RegisterWith } from "@/components/general-components/registerWith";
import InputField from "@/components/common/InputField";
import { encodeRedirectTarget, resolveRedirectTarget } from "@/utils/authRedirect";

// Hooks & Context
import { useLoading } from "@/hooks/useLoading";
import { usePageContext } from "@/context/page-context";
import { useUserContext, normalizeUser, userMustChangePassword } from "@/context/user-context";
import { useGoogleOAuthConfig } from "@/context/google-oauth-context";

// Utilities & Assets
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { extractLoginTokenAndUser, isSuccessfulLoginBody } from "@/utils/authLoginResponse";
import mailIcon from "@/svgs/envelope.svg";
import googleIcon from "@/svgs/googleIcon.svg";
import facebookIcon from "@/svgs/facebookIcon.svg";
import Link from "next/link";
import CustomToast from "@/components/general-components/CustomToast";


declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

/** Only rendered when Google OAuth is configured; uses useGoogleLogin so must be inside GoogleOAuthProvider. */
function GoogleLoginButton({
  setOverlayMessage,
  setOverlayVisible,
  finalizeAuthenticatedSession,
  isDisabled,
}: {
  setOverlayMessage: (m: string) => void;
  setOverlayVisible: (v: boolean) => void;
  finalizeAuthenticatedSession: (data: { token?: string; user: unknown }) => void;
  isDisabled: boolean;
}) {
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      setOverlayMessage("Signing in with Google...");
      setOverlayVisible(true);
      try {
        const url = URLS.BASE + URLS.authGoogle;
        const response = await POST_REQUEST(url, { idToken: codeResponse.code });

        if (response.success) {
          const payload = response.data as any;
          finalizeAuthenticatedSession({
            token: payload?.token,
            user: payload?.user ?? payload,
          });

          toast.success("Authentication successful via Google!");
        } else if (response.error) {
          toast.error(response.error);
          setOverlayVisible(false);
        } else {
          toast.error("Google authentication failed. Please try again.");
          setOverlayVisible(false);
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Google sign-in failed, please try again!");
        setOverlayVisible(false);
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or failed."),
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

const Login: FC = () => {
  const isLoading = useLoading();
  const { isContactUsClicked } = usePageContext();
  const { user, setUser, isInitialized } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? "";
  const fromParam = searchParams?.get('from') || null;
  const resolvedRedirectTarget = useMemo(
    () => resolveRedirectTarget(fromParam, searchParams),
    [fromParam, searchParamsString],
  );
  const encodedRedirectTarget = encodeRedirectTarget(resolvedRedirectTarget);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState<string>("");

  // ✅ NEW STATE: Track if Facebook SDK is initialized
  const [isFbSdkReady, setIsFbSdkReady] = useState(false);

  // Memoized callback for password toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Enter email"),
    password: Yup.string().required("Password is required"),
  });

  // Redirect authenticated users away from login (dashboard, or forced password change)
  useEffect(() => {
    if (!isInitialized || !user) return;
    if (userMustChangePassword(user)) {
      router.replace("/auth/change-password");
      return;
    }
    router.replace("/dashboard");
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (resolvedRedirectTarget) {
      try { sessionStorage.setItem('redirectAfterLogin', resolvedRedirectTarget); } catch {}
    }
  }, [resolvedRedirectTarget]);

  const finalizeAuthenticatedSession = useCallback(
    (data: { token?: string; user: unknown }) => {
      const userPayload = data?.user;
      const token = data?.token;

      if (token) Cookies.set("token", token);
      let normalized = normalizeUser(userPayload as any);
      if (normalized && typeof window !== "undefined") {
        try {
          if (!normalized.userType) {
            const stored = localStorage.getItem("userType");
            if (stored)
              normalized = {
                ...normalized,
                userType: stored.trim() as "Agent" | "Landowners" | "FieldAgent" | "Developer",
              };
          }
          if (normalized.userType) localStorage.setItem("userType", normalized.userType);
        } catch {}
      }
      setUser(normalized);

      const forced = userMustChangePassword(normalized);
      setOverlayMessage(
        forced ? "You must update your password before continuing." : "Loading your dashboard...",
      );
      setOverlayVisible(true);

      setTimeout(() => {
        if (forced) {
          router.push("/auth/change-password");
          setOverlayVisible(false);
          return;
        }

        const redirectUrl = resolvedRedirectTarget || sessionStorage.getItem("redirectAfterLogin");
        if (redirectUrl) {
          try {
            sessionStorage.removeItem("redirectAfterLogin");
          } catch {}
          router.push(redirectUrl);
          setOverlayVisible(false);
          return;
        }

        router.push("/dashboard");
        setOverlayVisible(false);
      }, forced ? 400 : 1500);
    },
    [router, setUser, resolvedRedirectTarget],
  );

  const handleAuthSuccess = useCallback(
    (response: any) => {
      const extracted = extractLoginTokenAndUser(response);
      if (extracted) {
        finalizeAuthenticatedSession({ token: extracted.token, user: extracted.user });
        return;
      }
      const data = response?.data ?? response;
      const userPayload = data?.user ?? response?.user ?? data;
      const token = data?.token ?? response?.token;
      finalizeAuthenticatedSession({ token, user: userPayload });
    },
    [finalizeAuthenticatedSession],
  );
  
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const url = URLS.BASE + URLS.authLogin;
        const payload = { email: values.email.trim(), password: values.password };

        await toast.promise(
          (async () => {
            let response: any;
            try {
              response = await POST_REQUEST(url, payload);
            } catch (err) {
              const raw = (err as Error)?.message || "Login failed";
              const msg =
                /failed to fetch|network error|request timed out|network request failed|load failed/i.test(String(raw))
                  ? "Unable to reach the server. Check your connection and try again."
                  : raw;
              throw new Error(msg);
            }

            if (isSuccessfulLoginBody(response)) {
              handleAuthSuccess(response);
              return "Login successful";
            }

            const raw = (response as any).error || (response as any).message || "Login failed";
            const msg =
              /failed to fetch|network error|request timed out|network request failed|load failed/i.test(String(raw))
                ? "Unable to reach the server. Check your connection and try again."
                : raw;
            throw new Error(msg);
          })(),
          {
            loading: "Logging in...",
            success: "Login successful!",
            error: (error: any) => {
              const m = error?.message || "Sign in failed, please try again!";
              if (/failed to fetch|network error|request timed out|network request failed|load failed/i.test(String(m))) {
                return "Unable to reach the server. Check your connection and try again.";
              }
              return m;
            },
          }
        );
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { isConfigured: googleOAuthConfigured } = useGoogleOAuthConfig();

  // ✅ MODIFIED useEffect for Facebook SDK initialization
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v21.0",
      });
      // Set the state to true once initialization is complete
      setIsFbSdkReady(true); 
    };

    return () => {
      // Cleanup: check if script exists before removal to prevent errors
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // ✅ MODIFIED handleFacebookLogin to check isFbSdkReady
  const handleFacebookLogin = () => {
    if (!isFbSdkReady) {
      toast.error("Facebook SDK is still loading. Please wait a moment.");
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
                  };

                  setOverlayMessage("Signing in with Facebook...");
                  setOverlayVisible(true);
                  const result = await POST_REQUEST(url, payload);

                  if (result.success) {
                    const d = result.data as any;
                    finalizeAuthenticatedSession({
                      token: d?.token,
                      user: d?.user ?? d,
                    });

                    toast.success("Authentication successful via Facebook!");
                  } else if (result.error) {
                    toast.error(result.error);
                    setOverlayVisible(false);
                  } else {
                    toast.error("Facebook authentication failed. Please try again.");
                    setOverlayVisible(false);
                  }
                  
                } catch (error) {
                  console.error("Facebook login API error:", error);
                  toast.error("Facebook login failed, please try again!");
                  setOverlayVisible(false);
                }
              },
            );
          } else {
            toast.error("Facebook login was cancelled");
          }
        },
        { scope: "email,public_profile" },
      );
    } else {
      // This toast should theoretically not be hit if isFbSdkReady is true
      toast.error("Facebook SDK not available."); 
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
              Welcome Back to Your Property Journey
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              Sign in to access your dashboard, manage listings, and connect with opportunities.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Access your listings</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Track inspections</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Connect with clients</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <div className="text-2xl font-bold text-[#8DDB90] font-display">1000+</div>
              <div className="text-white/60 text-sm">Properties</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#8DDB90] font-display">500+</div>
              <div className="text-white/60 text-sm">Happy Clients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#8DDB90] font-display">50+</div>
              <div className="text-white/60 text-sm">Agents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
        <form
          onSubmit={formik.handleSubmit}
          className="w-full max-w-md flex flex-col gap-5"
        >
          {/* Header */}
          <div className="text-center lg:text-left mb-2">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#09391C] mb-2">
              Sign In
            </h2>
            <p className="text-[#5A5D63] text-sm sm:text-base">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form Inputs */}
          <div className="w-full flex flex-col gap-4">
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
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              showPasswordToggle={true}
              isPasswordVisible={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#09391C] font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            value={isSubmitting ? "Signing In..." : "Sign In"}
            className="min-h-[52px] w-full rounded-xl bg-[#09391C] text-white text-base font-semibold hover:bg-[#0B423D] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            type="submit"
            isDisabled={isSubmitting}
            onSubmit={formik.handleSubmit}
            green={false}
          />

          {/* Social Logins */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#F8FAF8] px-3 text-gray-500 text-xs font-medium uppercase tracking-wide">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {googleOAuthConfigured ? (
              <GoogleLoginButton
                setOverlayMessage={setOverlayMessage}
                setOverlayVisible={setOverlayVisible}
                finalizeAuthenticatedSession={finalizeAuthenticatedSession}
                isDisabled={overlayVisible}
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
              text={isFbSdkReady ? "Facebook" : "Loading..."}
              onClick={handleFacebookLogin}
              isDisabled={!isFbSdkReady || overlayVisible}
            />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-2">
            Don&apos;t have an account?{" "}
            <Link
              href={encodedRedirectTarget ? `/auth/register?from=${encodedRedirectTarget}` : "/auth/register"}
              className="font-semibold text-[#09391C] hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>

      <OverlayPreloader
        isVisible={overlayVisible}
        message={overlayMessage || "Processing..."}
      />
    </section>
  );
};

export default Login;
