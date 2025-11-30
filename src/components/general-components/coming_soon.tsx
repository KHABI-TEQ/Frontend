/** @format */

'use client';
import Image from 'next/image';
import React from 'react';
import comingSoon from '@/assets/noImageAvailable.png';

const ComingSoon = () => {
  return (
    <div className='w-full flex justify-center items-center'>
      <div className='container min-h-[600px] flex flex-col justify-center items-center gap-[20px] px-4 md:px-8'>
        <div className='lg:w-[654px] flex flex-col justify-center items-center gap-[20px] w-full'>
          <div className='w-full flex justify-center'>
            <Image
              src={comingSoon}
              width={400}
              height={50}
              alt='Coming Soon Icon'
              className='w-full max-w-[400px] h-auto'
            />
          </div>
          <div className='flex flex-col justify-center items-center gap-[10px]'>
            <p className='text-2xl md:text-lg text-center text-[#5A5D63] leading-[160%] tracking-[5%]'>
              We are working hard to bring you an amazing experience... Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
