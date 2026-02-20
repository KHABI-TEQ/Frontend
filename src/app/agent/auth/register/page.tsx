/* eslint-disable react-hooks/exhaustive-deps */
/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Loading from '@/components/loading';
import { useLoading } from '@/hooks/useLoading';
import Image from 'next/image';
import React, { FC, useEffect, useState } from 'react';
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
import { useUserContext, normalizeUser } from '@/context/user-context';
import axios from 'axios';
import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';
import { resolve } from 'path';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useGoogleLogin } from '@react-oauth/google';
import CustomToast from '@/components/CustomToast';

const Register = () => {
  const isLoading = useLoading();
  const { setUser, user } = useUserContext();
  const { isContactUsClicked } = usePageContext();
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

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

    firstName: Yup.string()
      .matches(/^[a-zA-Z]+$/, 'First name must only contain letters') // Only letters
      .required('Firstname is required'),

    lastName: Yup.string()
      .matches(/^[a-zA-Z]+$/, 'Last name must only contain letters') // Only letters
      .required('Lastname is required'),

    phone: Yup.string()
      .matches(/^[0-9]+$/, 'Phone number must only contain digits') // Only digits
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number must be at most 15 digits')
      .required('Phone number is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsDisabled(true);
      try {
        const url = URLS.BASE + URLS.agentSignup;
        const { phone, ...payload } = values;
        await toast.promise(
          POST_REQUEST(url, {
            ...payload,
            phoneNumber: String(values.phone),
          }).then((response) => {
            console.log('response from signup', response);
            if ((response as any).id) {
              toast.success('Registration successful');
              setUser(normalizeUser((response as any).user));
              localStorage.setItem('fullname', `${formik.values.firstName} ${formik.values.lastName}`);
              localStorage.setItem('email', `${formik.values.email}`);
              localStorage.setItem('phoneNumber', `${String(formik.values.phone)}`);
              setTimeout(() => {
                toast.custom(
                  <CustomToast
                    title='Registration successful'
                    subtitle='A Verification has been sent to your email. Please verify your email to continue'
                  />
                );
              }, 2000);
              setIsDisabled(false);
              // router.push('/auth/agent/form');
              return 'Registration successful';
            } else {
              const errorMessage = (response as any).error || 'Registration failed';
              toast.error(errorMessage);
              setIsDisabled(false);
              throw new Error(errorMessage);
            }
          }),
          {
            loading: 'Signing up...',
            // success: 'Registration successful',
            // error: 'Registration failed',
          }
        );
      } catch (error) {
        console.log(error);
        setIsDisabled(false);
        // toast.error('Registration failed, please try again!');
      }
    },
  });

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse: any) => {
      console.log(codeResponse);
      const url = URLS.BASE + URLS.agent + URLS.googleSignup;

      await POST_REQUEST(url, { code: codeResponse.code }).then(async (response) => {
        const res = response as any;
        if (res.id) {
          Cookies.set('token', res.token);
          console.log('response', res);
          setUser(normalizeUser(res.user));
          toast.success('Registration successful');
          router.push('/agent/onboard');
        }
        console.log(res);
        if (res.error) {
          toast.error(res.error);
        }
        // toast.error(response.message);
      });
    },
    onError: (errorResponse: any) => toast.error(errorResponse.message),
  });

  useEffect(() => {
    if (user) router.push('/agent/briefs');
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
          <h2 className='text-[24px] font-display leading-[38.4px] font-semibold text-[#09391C]'>Register with us</h2>
          <div className='w-full min-h-[460px] flex flex-col gap-[15px] lg:px-[60px]'>
            <Input
              formik={formik}
              title='Email'
              isDisabled={isDisabled}
              id='email'
              icon={mailIcon}
              type='email'
              placeholder='Enter your email'
            />
            <Input
              formik={formik}
              title='Password'
              isDisabled={isDisabled}
              id='password'
              icon={''}
              type='password'
              placeholder='Enter your password'
            />
            <Input
              formik={formik}
              title='First name'
              isDisabled={isDisabled}
              id='firstName'
              icon={''}
              type='text'
              placeholder='Enter your first name'
            />
            <Input
              formik={formik}
              title='Last name'
              isDisabled={isDisabled}
              id='lastName'
              icon={''}
              type='text'
              placeholder='Enter your last name'
            />
            <Input
              formik={formik}
              title='Phone'
              id='phone'
              icon={phoneIcon}
              type='number'
              placeholder='Enter your phone number'
              isDisabled={isDisabled}
            />
          </div>
          <div className='flex justify-center items-center w-full lg:px-[60px]'>
            <RadioCheck
              isDisabled={isDisabled}
              onClick={() => {
                setAgreed(!agreed);
              }}
              type='checkbox'
              name='agree'
              className='w-full'
              value={`By clicking here, I agree to the Khabi-Teq realty <br/> <a href='/policies_page'><span style='color: #0B423D; font-weight: bold'>Policy</span> and <span style='color: #0B423D; font-weight: bold'>Rules</span></a>`}
            />
          </div>
          {/**Button */}
          <Button
            value={`${isDisabled ? 'Registering...' : 'Register'}`}
            isDisabled={isDisabled}
            className='min-h-[65px] w-full py-[12px] px-[24px] bg-[#8DDB90] text-[#FAFAFA] text-base leading-[25.6px] font-bold'
            type='submit'
            onSubmit={formik.handleSubmit}
            green={true}
          />
          {/**Already have an account */}
          <span className='text-base leading-[25.6px] font-normal'>
            Already have an account?{' '}
            <Link className='font-semibold text-[#09391C]' href={'/agent/auth/login'}>
              Sign In
            </Link>
          </span>
          {/**Google | Facebook */}
          <div className='flex justify-between lg:flex-row flex-col gap-[15px]'>
            <RegisterWith icon={googleIcon} text='Continue with Google' onClick={googleLogin} />
            <RegisterWith icon={facebookIcon} text='Continue with Facebook' />
          </div>
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
  id: string;
  icon: StaticImport | string;
  formik: any;
  isDisabled?: boolean;
}

const Input: FC<InputProps> = ({ className, id, title, type, placeholder, icon, formik, isDisabled }) => {
  const fieldError = formik.errors[id];
  const fieldTouched = formik.touched[id];
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
          disabled={isDisabled}
          placeholder={placeholder ?? 'This is placeholder'}
          className='w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px] hide-scrollbar disabled:bg-gray-200'
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
      {fieldError && fieldTouched && <span className='text-red-600 text-sm'>{fieldError}</span>}
    </label>
  );
};

export default Register;
