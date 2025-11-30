/** @format */
'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import reviewIcon from '@/svgs/underReview.svg';

const ReviewingApplication = () => {
  const [email, setEmail] = useState('yourmail@gmail.com');

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <div className='w-full flex justify-center items-center'>
        <div className='lg:w-[60%] flex flex-col justify-center items-center gap-[20px] w-full px-[20px] mt-10 md:mt-40'>
          <div className='w-[81px] h-[81px] rounded-full bg-[#1976D2] flex items-center justify-center'>
            <Image
              src={reviewIcon}
              width={40}
              height={40}
              alt=''
              className='w-[40px] h-[40px]'
            />
          </div>
          <div className='flex flex-col justify-center items-center gap-[20px]'>
            <h2 className='font-display text-center text-3xl md:text-2xl font-bold'>
              <span className='text-[#1976D2]'>Application</span>{' '}
              <span className='text-[#8DDB90]'>Under Review</span>
            </h2>
            <p className='text-base md:text-[18px] text-center text-[#5A5D63] leading-[160%] tracking-[5%]'>
            Thank you for registering with Khabi-Teq Realty. We are currently verifying your details for approval. If additional information is required, we will contact you shortly. Please check your email ({email}) for further updates.
            </p>
          </div>
        </div>
    </div>
  );
};

export default ReviewingApplication;
