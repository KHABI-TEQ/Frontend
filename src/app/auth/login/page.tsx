/**
 * @format
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { FC, useEffect, useState, useCallback } from "react"; // Added useCallback
import * as Yup from "yup";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

// Components
import Loading from "@/components/loading-component/loading";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
import Button from "@/components/general-components/button";
import { RegisterWith } from "@/components/general-components/registerWith";
import InputField from "@/components/common/InputField";

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

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Memoized callback for password toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Enter email"),
    password: Yup.string().required("Password is required"),
  });

  const handleAuthSuccess = useCallback((response: any) => {   
    const userPayload = response.user;

    sessionStorage.setItem("user", JSON.stringify(userPayload));
    Cookies.set("token", response.token);
    setUser(userPayload);

    setOverlayVisible(true);

    setTimeout(() => {
      if (userPayload.userType === "Agent") {
        if (!userPayload.agentData?.agentType) {
          router.push("/agent/onboard");
        } else if (userPayload.accountApproved === false) {
          router.push("/agent/under-review");
        } else if (userPayload.phoneNumber && userPayload.agentData.agentType) {
          router.push("/agent/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
      setOverlayVisible(false);
    }, 1500);
  }, [router, setUser]);

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
          (async () => {
            const res = await POST_REQUEST(url, values);
            if (!res || res?.error || !res?.user?.id) {
              throw new Error(res?.message || res?.error || "Sign In failed");
            }
            return res;
          })(),
          {
            loading: "Logging in...",
            success: "Login successful!",
            error: (error: any) => {
              console.log(error, "Login Error");
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
      try {
        const url = URLS.BASE + URLS.authGoogle;
        const response = await POST_REQUEST(url, { idToken: codeResponse.code });

        if (response.user?.id) {
          toast.success("Sign in successful");
          handleAuthSuccess(response);
        } else {
          toast.error(response.error || "Google sign-in failed.");
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Google sign-in failed, please try again!");
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or failed."),
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID", // Replace with your actual APP ID
        cookie: true,
        xfbml: true,
        version: "v21.0",
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleFacebookLogin = () => {
    if (typeof window !== "undefined" && window.FB) {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            window.FB.api(
              "/me",
              { fields: "name,email,first_name,last_name" },
              async (userInfo: any) => {
                try {
                  const url = URLS.BASE + URLS.user + URLS.facebookLogin;
                  const payload = {
                    accessToken: response.authResponse.accessToken,
                    userID: response.authResponse.userID,
                    email: userInfo.email,
                    firstName: userInfo.first_name,
                    lastName: userInfo.last_name,
                  };

                  const result = await POST_REQUEST(url, payload);
                  if (result.user?.id) {
                    toast.success("Sign in successful");
                    handleAuthSuccess(result);
                  } else {
                    toast.error(result.error || "Facebook login failed");
                  }
                } catch (error) {
                  console.error("Facebook login API error:", error);
                  toast.error("Facebook login failed, please try again!");
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
              label="Email" // Changed title to label
              name="email" // Use 'name' prop instead of 'id' for Formik
              icon={mailIcon}
              type="email"
              placeholder="Enter your email"
            />
            <InputField
              formik={formik}
              label="Password" // Changed title to label
              name="password" // Use 'name' prop
              type="password"
              placeholder="Enter your password"
              showPasswordToggle={true} // Enable password toggle
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
              href={"/auth/register"}
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
            />
            <RegisterWith
              icon={facebookIcon}
              text="Continue with Facebook"
              onClick={handleFacebookLogin}
            />
          </div>
          
        </form>
      </div>

      <OverlayPreloader
        isVisible={overlayVisible}
        message="Loading your dashboard..."
      />

    </section>
  );
};

export default Login;