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
import { useUserContext } from "@/context/user-context";

// Utilities & Assets
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import mailIcon from "@/svgs/envelope.svg";
import googleIcon from "@/svgs/googleIcon.svg";
import facebookIcon from "@/svgs/facebookIcon.svg";
import Link from "next/link";


declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const Login: FC = () => {
  const isLoading = useLoading();
  const { isContactUsClicked } = usePageContext();
  const { setUser } = useUserContext();
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

  useEffect(() => {
    if (resolvedRedirectTarget) {
      try { sessionStorage.setItem('redirectAfterLogin', resolvedRedirectTarget); } catch {}
    }
  }, [resolvedRedirectTarget]);

  const handleAuthSuccess = useCallback((response: any) => {
    const userPayload = response.data.user;

    Cookies.set("token", response.data.token);
    setUser(userPayload);

    setOverlayMessage("Loading your dashboard...");
    setOverlayVisible(true);

    setTimeout(() => {
      const redirectUrl = resolvedRedirectTarget || sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        try { sessionStorage.removeItem('redirectAfterLogin'); } catch {}
        router.push(redirectUrl);
        setOverlayVisible(false);
        return;
      }

      router.push("/dashboard");

      setOverlayVisible(false);
    }, 1500);
  }, [router, setUser, resolvedRedirectTarget]);
  
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

        const response = await toast.promise(
          POST_REQUEST(url, values),
          {
            loading: "Logging in...",
            success: "Login successful!",
            error: (error: any) => {
              console.log(error, "Login Error");
              // Assuming error object from POST_REQUEST has a message property
              return error.message || "Sign In failed, please try again!"; 
            },
          }
        );

        handleAuthSuccess(response);
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      setOverlayMessage("Signing in with Google...");
      setOverlayVisible(true);
      try {
        const url = URLS.BASE + URLS.authGoogle;
        const response = await POST_REQUEST(url, { idToken: codeResponse.code });

        if (response.success) {
          Cookies.set("token", response.data.token);
          setUser(response.data.user);

          toast.success("Authentication successful via Google!");

          const redirectUrl = resolvedRedirectTarget || sessionStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            try { sessionStorage.removeItem('redirectAfterLogin'); } catch {}
            setOverlayVisible(false);
            router.push(redirectUrl);
            return;
          }

          setOverlayVisible(false);
          router.push("/dashboard");

        } else if (response.error) {
          toast.error(response.error);
        } else {
          toast.error("Google authentication failed. Please try again.");
        }

      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Google sign-in failed, please try again!");
      } finally {
        setOverlayVisible(false);
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or failed."),
  });

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
                    Cookies.set("token", result.data.token);
                    setUser(result.data.user);

                    toast.success("Authentication successful via Facebook!");

                    const redirectUrl = resolvedRedirectTarget || sessionStorage.getItem('redirectAfterLogin');
                    if (redirectUrl) {
                      try { sessionStorage.removeItem('redirectAfterLogin'); } catch {}
                      setOverlayVisible(false);
                      router.push(redirectUrl);
                      return;
                    }

                    setOverlayVisible(false);
                    router.push("/dashboard");

                  } else if (result.error) {
                    toast.error(result.error);
                  } else {
                    toast.error("Facebook authentication failed. Please try again.");
                  }
                  
                } catch (error) {
                  console.error("Facebook login API error:", error);
                  toast.error("Facebook login failed, please try again!");
                } finally {
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
      className={`flex items-center justify-center bg-[#EEF1F1] w-full ${
        isContactUsClicked && "filter brightness-[30%]"
      } transition-all duration-500`}
    >
      <div className="container flex items-center justify-center py-[30px] mt-[20px] px-[25px] lg:px-0">
        <form
          onSubmit={formik.handleSubmit}
          className="lg:w-[600px] w-full min-h-[700px] flex flex-col items-center gap-[20px]"
        >
          <h2 className="text-[24px] font-display leading-[38.4px] font-semibold text-[#09391C]">
            Welcome Back
          </h2>
          <div className="w-full flex flex-col gap-[15px] lg:px-[60px]">
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

            {/* Button */}
            <Button
              value={isSubmitting ? "Signing In..." : "Sign In"}
              className="min-h-[60px] w-full rounded-md py-[12px] duration-300 transition ease-in-out px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold mt-6"
              type="submit"
              isDisabled={isSubmitting}
              onSubmit={formik.handleSubmit}
              green={true}
            />
          </div>
          

          {/* Account Links */}
          <p className="text-base leading-[25.6px] font-normal">
            Don&apos;t have an account?{" "}
            <Link
              className="font-semibold text-[#09391C]"
              href={encodedRedirectTarget ? `/auth/register?from=${encodedRedirectTarget}` : "/auth/register"}
            >
              Sign Up
            </Link>
          </p>
          <p className="text-base leading-[25.6px] font-normal">
            Forgot your password?{" "}
            <Link
              className="font-semibold text-[#09391C]"
              href={"/auth/forgot-password"}
            >
              Reset
            </Link>
          </p>

          {/* Social Logins */}
          <div className="flex w-full justify-center lg:flex-row flex-col gap-[15px]">
            <RegisterWith
              icon={googleIcon}
              text="Continue with Google"
              onClick={googleLogin}
              isDisabled={overlayVisible}
            />
            {/* ✅ MODIFIED RegisterWith for Facebook to show loading state and be disabled */}
            <RegisterWith
              icon={facebookIcon}
              text={isFbSdkReady ? "Continue with Facebook" : "Loading Facebook..."}
              onClick={handleFacebookLogin}
              isDisabled={!isFbSdkReady || overlayVisible}
            />
          </div>
          
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
