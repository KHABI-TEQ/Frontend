/**
 * @format
 */

/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import Loading from "@/components/loading-component/loading";
import { useLoading } from "@/hooks/useLoading";
import React, { FC, useState, useEffect } from "react";
import mailIcon from "@/svgs/envelope.svg";
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
import { useRouter } from "next/navigation";
import InputField from "@/components/common/InputField";

const ForgotPassword = () => {
  const isLoading = useLoading();
  const { isContactUsClicked } = usePageContext();
  const { user } = useUserContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Enter email"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const url = URLS.BASE + URLS.authRequestResetPassword;

        await toast.promise(
          POST_REQUEST(url, { email: values.email }).then((response) => {
            if (response.success) {
              // Store email for verification step
              localStorage.setItem("resetEmail", values.email);
              router.push("/auth/forgot-password/verify");
              return "6-digit reset code sent to your email";
            } else {
              throw new Error((response as any).error || "An error occurred");
            }
          }),
          {
            loading: "Sending reset code...",
            success: "6-digit reset code sent to your email",
            error: (error: { message: any }) => {
              console.log("error", error);
              return (
                error.message || "An error occurred while sending reset code"
              );
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
            Forgot Password
          </h2>
          <p className="text-center text-gray-600 max-w-md">
            Enter your email address and we&apos;ll send you a 6-digit code to
            reset your password.
          </p>
          <div className="w-full flex flex-col gap-[15px] lg:px-[60px]">
            <InputField
              formik={formik}
              label="Email"
              name="email"
              icon={mailIcon}
              type="email"
              placeholder="Enter your email"
            />
          </div>
          {/**Button */}
          <div className="dd w-full lg:px-[60px]">
            <Button
              value={isSubmitting ? "Sending..." : "Send Reset Code"}
              className="min-h-[65px] w-full py-[12px] px-[24px] rounded-md bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold mt-6"
              type="submit"
              isDisabled={isSubmitting || !formik.values.email}
              green={true}
            />
          </div>
          
          {/**Back to login */}
          <p className="text-base leading-[25.6px] font-normal">
            Remembered your password?{" "}
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
      <div className="flex">
        <input
          name={id}
          type={type}
          value={formik.values[id || "email"]}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          disabled={isDisabled}
          placeholder={placeholder ?? "This is placeholder"}
          className="w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px] hide-scrollbar disabled:bg-gray-200"
        />
      </div>
      {formik.touched[id || "email"] && formik.errors[id || "email"] && (
        <span className="text-red-600 text-sm">
          {formik.errors[id || "email"]}
        </span>
      )}
    </label>
  );
};

export default ForgotPassword;
