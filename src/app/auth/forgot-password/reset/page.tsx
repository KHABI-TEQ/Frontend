/**
 * @format
 */

/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import React, { FC, useEffect, useState, Suspense, useCallback } from "react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import * as Yup from "yup";
import { useFormik } from "formik";
import Button from "@/components/general-components/button";
import Link from "next/link";
import { usePageContext } from "@/context/page-context";
import { useUserContext } from "@/context/user-context";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import InputField from "@/components/common/InputField";

const ResetPassword = () => {
  const isLoading = useLoading();
  const { isContactUsClicked } = usePageContext();
  const { user } = useUserContext();
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

  // Memoized callback for confirm password toggle (for InputField)
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    // Check if we have the reset code and email from verification step
    const resetCode = localStorage.getItem("resetCode");
    const resetEmail = localStorage.getItem("resetEmail");

    if (!resetCode || !resetEmail) {
      toast.error("Invalid or expired reset session");
      router.push("/auth/forgot-password");
      return;
    }

    if (resetCode.length !== 6) {
      toast.error("Invalid verification code");
      router.push("/auth/forgot-password/verify");
      return;
    }
  }, [router]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(
        /[\W_]{2,}/,
        "Password must contain at least two special characters",
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .required("Confirm password is required")
      .oneOf([Yup.ref("password"), ""], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (!values.password || !values.confirmPassword) {
          toast.error("Please fill all fields");
          return;
        }

        if (values.password !== values.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        const resetCode = localStorage.getItem("resetCode");
        const resetEmail = localStorage.getItem("resetEmail");

        if (!resetCode || !resetEmail) {
          toast.error("Invalid reset session");
          return;
        }

        const url = URLS.BASE + URLS.authResetPassword;
        const payload = {
          token: resetCode,
          email: resetEmail,
          newPassword: values.password,
        };

        await toast.promise(
          POST_REQUEST(url, payload).then((response) => {
            if (response.success) {
              // Clear stored reset data
              localStorage.removeItem("resetEmail");
              localStorage.removeItem("resetCode");
              router.push("/auth/login");
              return "Password reset successful";
            } else {
              throw new Error(
                (response as any).error || "Password reset failed",
              );
            }
          }),
          {
            loading: "Resetting Password...",
            success:
              "Password reset successful! You can now login with your new password.",
            error: (error: { message: any }) => {
              console.log("error", error);
              return error.message || "An error occurred";
            },
          },
        );
      } catch (error) {
        console.log("Unexpected error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (isLoading) return <Loading />;

  return (
    <section
      className={`flex items-center justify-center bg-[#EEF1F1] w-full ${
        isContactUsClicked && "filter brightness-[30%]"
      } transition-all duration-500`}
    >
      <div className="container flex items-center justify-center py-[30px] mt-[60px] px-[25px] lg:px-0">
        <form
          onSubmit={formik.handleSubmit}
          className="lg:w-[600px] w-full min-h-[500px] flex flex-col items-center gap-[20px]"
        >
          <h2 className="text-[24px] font-display leading-[38.4px] font-semibold text-[#09391C]">
            Reset Your Password
          </h2>
          <p className="text-center text-gray-600 max-w-md">
            Enter your new password below. Make sure it&apos;s strong and
            secure.
          </p>
          <div className="w-full flex flex-col gap-[15px] lg:px-[60px]">
            <InputField
              formik={formik}
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your new password"
              showPasswordToggle={true}
              isPasswordVisible={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
            />
            <InputField
              formik={formik}
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="CConfirm your new password"
              showPasswordToggle={true}
              isPasswordVisible={showConfirmPassword}
              togglePasswordVisibility={toggleConfirmPasswordVisibility}
            />
          </div>
          {/**Button */}
          <div className="w-full lg:px-[60px]">
            <Button
              value={isSubmitting ? "Resetting..." : "Reset Password"}
              className="min-h-[60px] w-full rounded-md py-[12px] duration-300 transition ease-in-out px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold mt-6"
              type="submit"
              isDisabled={
                isSubmitting ||
                !formik.values.password ||
                !formik.values.confirmPassword ||
                !!formik.errors.password ||
                !!formik.errors.confirmPassword
              }
              green={true}
            />
          </div>
          
          {/**Back to login */}
          <p className="text-base leading-[25.6px] font-normal">
            Remember your password?{" "}
            <Link className="font-semibold text-[#09391C]" href="/auth/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

interface InputProps {
  title: string;
  placeholder?: string;
  type: string;
  className?: string;
  id?: string;
  icon: StaticImport | string;
  formik: any;
  seePassword?: (type: boolean) => void;
  isSeePassword?: boolean;
  isDisabled?: boolean;
}

const Input: FC<InputProps> = ({
  className,
  id,
  title,
  type,
  placeholder,
  icon,
  formik,
  seePassword,
  isSeePassword,
  isDisabled,
}) => {
  return (
    <label
      htmlFor={id}
      className={`min-h-[80px] ${className} flex flex-col gap-[4px]`}
    >
      <span className="text-base leading-[25.6px] font-medium text-[#1E1E1E]">
        {title}
      </span>
      <div className="flex items-center relative">
        <input
          name={id}
          type={
            type === "password" ? (isSeePassword ? "text" : "password") : type
          }
          value={formik.values[id || "password"]}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          disabled={isDisabled}
          placeholder={placeholder ?? "This is placeholder"}
          className="w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px] hide-scrollbar disabled:bg-gray-200"
        />
        {type === "password" && (
          <FontAwesomeIcon
            title={isSeePassword ? "Hide password" : "See password"}
            className="cursor-pointer transition absolute top-5 right-3 duration-500"
            icon={isSeePassword ? faEye : faEyeSlash}
            size="sm"
            color="black"
            onClick={() => {
              seePassword?.(!isSeePassword);
            }}
          />
        )}
      </div>
      {formik.touched[id || "password"] && formik.errors[id || "password"] && (
        <span className="text-red-600 text-sm">
          {formik.errors[id || "password"]}
        </span>
      )}
    </label>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPassword />
    </Suspense>
  );
}
