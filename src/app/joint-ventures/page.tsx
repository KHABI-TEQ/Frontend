/** @format */

'use client';
import Loading from '@/components/loading-component/loading';
import { useLoading } from '@/hooks/useLoading';
import Image from 'next/image';
import React from 'react';
import arrowRIcon from '@/svgs/arrowR.svg';
import Link from 'next/link';
import Button from '@/components/general-components/button';

const JointVentures = () => {
  const isLoading = useLoading();

  if (isLoading) return <Loading />;
  return (
    <section className='w-full flex justify-center items-center lg:px-[40px] px-[20px]'>
      <div className='container border border-zinc-900 border-dashed min-h-[800px] flex flex-col gap-[30px] py-[40px]'>
        <div className='min-w-[253px] min-h-[32px] flex items-center gap-[24px]'>
          <Image
            src={arrowRIcon}
            alt=''
            width={1000}
            height={1000}
            className='w-[24px] h-[24px]'
          />
          <div className='min-w-[205px] min-h-[32px] flex items-center gap-[8px]'>
            <Link
              href={'/'}
              className='text-[20px] leading-[32px] text-[#25324B] font-normal'>
              Home
            </Link>
            <svg
              width='4'
              height='4'
              viewBox='0 0 4 4'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <circle cx='2' cy='2' r='2' fill='#25324B' />
            </svg>
            <span className='text-[20px] leading-[32px] font-medium text-[#09391C]'>
              Joint Ventures
            </span>
          </div>
        </div>
        <div className='w-full min-h-[400px] border border-black border-dashed flex flex-col justify-center items-center gap-[20px]'>
          <h2 className='text-[40px] leading-[64px] font-semibold text-[#09391C] font-display'>
            Understanding Joint Ventures (JV) at{' '}
            <span className='text-[#8DDB90] font-display'>Khabi-Teq</span>
          </h2>
          <span className='text-[20px] leading-[32px] text-center text-[#5A5D63]'>
            Connecting Developers and Property Owners for Seamless Joint
            Ventures and Profitable Partnerships
          </span>
          {/**Buttons */}
          <div className='flex gap-[10px]'>
            <Button
              value='Submit Your Interest Now'
              className='min-h-[50px] py-[12px] px-[24px] gap-[10px] text-[#FAFAFA] text-base font-bold leading-[25.6px] text-center'
              green={true}
            />
            <Button
              value='Share Your Property Brief Today'
              className='min-h-[50px] py-[12px] px-[24px] gap-[10px] text-[#FAFAFA] text-base font-bold leading-[25.6px] text-center'
              green={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default JointVentures;
