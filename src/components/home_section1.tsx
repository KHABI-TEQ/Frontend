/** @format */
'use client';
import React, { useRef } from 'react';
import { useVisibility } from '@/hooks/useVisibility';
/**
 *
 * @returns Join our trusted network of agents and access exclusive property listings, connect with verified buyers and sellers, and grow your real estate business seamlessly
 */

const Section1 = () => {
  const textRef = useRef<HTMLSpanElement>(null);

  const isTextVisible = useVisibility(textRef);

  return (
    <section className='flex items-center justify-center pb-10'>
      <div className='container flex flex-col gap-[20px] items-center justify-center px-[20px] overflow-hidden'>
        <div className='px-[10px] mt-4 w-full flex flex-col gap-[24px] justify-center items-center '>
          <span
            ref={textRef}
            className={`font-normal lg:text-[18px] text-base leading-[25px] lg:leading-[28px] text-[#5A5D63] tracking-[5%] text-center ${
              isTextVisible && 'slide-from-left'
            }`}>
            Your trusted partner in Lagos&apos; real estate market. Since 2020,
            we&apos;ve been delivering expert solutions with integrity and
            personalized service, helping you navigate property sales, rentals,
            and more. Let us help you find your perfect property today
          </span>
        </div>
      </div>
    </section>
  );
};

export default Section1;
