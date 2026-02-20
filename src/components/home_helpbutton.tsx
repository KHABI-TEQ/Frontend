/** @format */

import React from 'react';
import Button from './button';

const HelpButton = () => {
  return (
    <section className='w-full flex justify-center items-center py-[40px]'>
      <div className='container flex flex-col gap-[20px]'>
        <h2 className='text-[25px] leading-[29.3px] text-center text-[#09391C]'>
          Get Started with Khabi-Teq Today
        </h2>
        <div className='flex justify-center items-center md:flex-row flex-col gap-[28px] flex-wrap'>
          <Button
            type='button'
            onClick={() => {
              window.location.href = '/buy_page'
            }}
            value={`Submit Your Preference`}
            className='h-[50px] font-bold text-[#FFFFFF] text-base min-w-[249px] py-[12px] px-[24px] bg-[#8DDB90] leading-[25.6px]'
          />
          <Button
            type='button'
            onClick={() => {
              window.location.href = '/sell_page'
            }}
            value={`Submit Your Brief`}
            className='h-[50px] font-bold text-[#FFFFFF] text-base min-w-[249px] py-[12px] px-[24px] bg-[#8DDB90] leading-[25.6px]'
          />
          <Button
            type='button'
            onClick={() => {
              window.location.href = '/joint_ventures'
            }}
            value={`Learn More About Joint Ventures`}
            className='h-[50px] font-bold text-[#FFFFFF] text-base min-w-[249px] py-[12px] px-[24px] bg-[#8DDB90] leading-[25.6px]'
          />
        </div>
      </div>
    </section>
  );
};

export default HelpButton;
