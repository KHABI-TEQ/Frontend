/** @format */
'use client';

import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import { useUserContext } from '@/context/user-context';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import googleIcon from '@/svgs/googleIcon.svg';
import facebookIcon from '@/svgs/facebookIcon.svg';
import { RegisterWith } from '@/components/general-components/registerWith';
import Button from '@/components/general-components/button';
import { useEffect } from 'react';

export default function LandlordPage() {
  const router = useRouter();
  const { setUser, user } = useUserContext();

  useEffect(() => {
    // If user is logged in, redirect them to appropriate page
    if (user) {
      if (user.userType === 'Landowners') {
        router.push('/my_listing');
      } else if (user.userType === 'Agent') {
        router.push('/agent/briefs');
      } else {
        router.push('/'); // Default redirect for other user types
      }
    }
  }, [user, router]);

  // If user is logged in, don't render the registration page
  if (user) {
    return null;
  }

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse: any) => {
      const url = URLS.BASE + URLS.user + URLS.googleSignup;

      await POST_REQUEST(url, { code: codeResponse.code, userType: 'Landowners' }).then(async (response) => {
        if ((response as any).id) {
          Cookies.set('token', (response as any).token);
          setUser((response as any).user);
          localStorage.setItem('email', (response as any).user?.email || '');
          toast.success('Registration successful');
          router.push('/my_listing');
        }
        if (response.error) {
          toast.error(response.error);
        }
      });
    },
    onError: (errorResponse: any) => toast.error(errorResponse.message),
  });

  return (
    <section className="min-h-[500px] overflow-hidden bg-[#EEF1F1] flex justify-center items-center w-full transition-all duration-500 my-10">
      <div className="container slide-from-right min-h-[400px] lg:w-[603px] w-full flex flex-col justify-center gap-[40px] items-center px-[20px]">
        <div className="text-center">
          <h2 className="text-[#09391C] text-[24px] leading-[38.4px] font-semibold font-display">
            Register with <span className="text-[#8DDB90] font-display">Khabiteq realty</span>
          </h2>
          <p className="text-[#5A5D63] text-[16px] mt-1 text-center">
            Are you a landowner looking to sell, rent, or explore joint ventures? <br />
            Register with us today and start closing deals!
          </p>
        </div>

        <div className="w-full min-h-[237px] flex flex-col justify-center items-center gap-[19px]">
          <div className="min-h-[147px] flex flex-col gap-[22px] w-full">
            <div className="flex justify-between lg:flex-row flex-col gap-[23px]">
              <RegisterWith
                icon={googleIcon}
                text="Continue with Google"
                onClick={googleLogin}
              />
              <RegisterWith icon={facebookIcon} text="Continue with Facebook" />
            </div>
            <Button
              type="button"
              value="Register"
              onClick={() => {
                window.location.href = '/auth/register?type=Landowners';
              }}
              className="bg-[#8DDB90] h-[65px] w-full py-[12px] px-[24px] text-[16px] leading-[25.6px] font-bold text-[#FAFAFA]"
            />
          </div>
          <span className="text-base text-center leading-[25.6px] font-normal">
            Already have an account?{' '}
            <Link className="font-semibold text-[#09391C]" href="/auth/login">
              Sign In
            </Link>
          </span>
          <span className="text-base text-center leading-[25.6px] font-normal">
            By Continuing you agree to the Khabi-Teq realty{' '}
            <Link className="font-semibold text-[#09391C]" href="/policies_page">
              policy and Rules
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
} 