/* eslint-disable react-hooks/exhaustive-deps */
/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Loading from '@/components/loading';
import { useLoading } from '@/hooks/useLoading';
import Image from 'next/image';
import React, { FC, useEffect, useState, Suspense } from 'react';
import mailIcon from '@/svgs/envelope.svg';
import phoneIcon from '@/svgs/phone.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Button from '@/components/button';
import RadioCheck from '@/components/radioCheck';
import { RegisterWith } from '@/components/registerWith';
import googleIcon from '@/svgs/googleIcon.svg';
import facebookIcon from '@/svgs/facebookIcon.svg';
import Link from 'next/link';
import { usePageContext } from '@/context/page-context';
import { useUserContext } from '@/context/user-context';
import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';
// import { resolve } from 'path';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useGoogleLogin } from '@react-oauth/google';

const ResetPassword = () => {
  const isLoading = useLoading();
  const { isContactUsClicked } = usePageContext();
  const { setUser, user } = useUserContext();
  const router = useRouter();

  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token') ?? '';
    if (!token || token.length < 100) {
      toast.error('Invalid token');
      router.push('/agent/login');
    }
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Enter email'),

    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      // .matches(
      //   /^(.*[A-Z]){2,}/,
      //   'Password must contain at least two uppercase letters'
      // ) // At least two uppercase letters
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter') // At least one lowercase letter
      // .matches(/\d/, 'Password must contain at least one number') // At least one number
      .matches(/[\W_]{2,}/, 'Password must contain at least two special character') // At least two special character
      .required('Password is required'),

    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password'), ''], 'Passwords must match'),
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    // validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('values', values);
        if (!values.password || !values.confirmPassword) {
          toast.error('Please fill all fields');
          return;
        }

        if (values.password !== values.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        const token = params.get('token');

        if (!token) {
          toast.error('Invalid token');
          return;
        }
        const url = URLS.BASE + URLS.agent + URLS.resetPassword;
        const payload = { token, password: values.password };

        await toast.promise(
          POST_REQUEST(url, payload).then((response) => {
            console.log('response from signin', response);

            if (response.success) {
              router.push('/agent/auth/login');

              return 'Password reset successful';
            } else {
              throw new Error((response as any).error || 'Password reset failed');
            }
          }),
          {
            loading: 'Resetting Password...',
            success: 'Password reset successful',
            error: (error: { message: any }) => {
              console.log('error', error);
              return error.message || 'An error occurred';
            },
          }
        );
      } catch (error) {
        console.log('Unexpected error:', error);
      }
    },
  });

  useEffect(() => {
    if (user) {
      if (!user.agentType) {
        router.push('/agent/onboard');
      } else if (user.phoneNumber && user.agentType) {
        router.push('/agent/briefs');
      }
    }
  }, [user]);

  if (isLoading) return <Loading />;

  return (
    <section
      className={`flex items-center justify-center bg-[#EEF1F1] w-full ${
        isContactUsClicked && 'filter brightness-[30%]'
      } transition-all duration-500`}
    >
      <div className='container flex items-center justify-center py-[30px] mt-[60px] px-[25px] lg:px-0'>
        <form
          onSubmit={formik.handleSubmit}
          className='lg:w-[600px] w-full min-h-[700px] flex flex-col items-center gap-[20px]'
        >
          <h2 className='text-[24px] font-display leading-[38.4px] font-semibold text-[#09391C]'>
            Reset Your Password
          </h2>
          <div className='w-full flex flex-col gap-[15px] lg:px-[60px]'>
            <Input
              formik={formik}
              title='Password'
              id='password'
              icon={''}
              type='password'
              placeholder='Enter your new password'
            />
            <Input
              formik={formik}
              title='Confirm Password'
              id='confirmPassword'
              icon={''}
              type='password'
              placeholder='Enter your new password again'
            />
          </div>
          {/**Button */}
          <Button
            value='Reset your password'
            className='min-h-[65px] w-full py-[12px] px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold mt-6'
            type='submit'
            // isDisabled={
            //   formik.isSubmitting || !formik.values.password || !formik.values.confirmPassword
            //   //   !formik.errors.password ||
            //   //   !formik.errors.confirmPassword
            // }
            onSubmit={formik.handleSubmit}
            green={true}
          />
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
}

const Input: FC<InputProps> = ({ className, id, title, type, placeholder, icon, formik }) => {
  return (
    <label htmlFor={id} className={`min-h-[80px] ${className} flex flex-col gap-[4px]`}>
      <span className='text-base leading-[25.6px] font-medium text-[#1E1E1E]'>{title}</span>
      <div className='flex'>
        <input
          name={id}
          type={type}
          value={formik.values[title]}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          placeholder={placeholder ?? 'This is placeholder'}
          className='w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px] hide-scrollbar'
        />
        {/* {icon ? (
          <Image
            src={icon}
            alt=''
            width={20}
            height={20}
            className='w-[20px] h-[20px] absolute ml-[330px] lg:ml-[440px] z-20 mt-[15px]'
          />
        ) : null} */}
      </div>
      {formik.touched[title] ||
        (formik.errors[title] && <span className='text-red-600 text-sm'>{formik.errors[title]}</span>)}
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
