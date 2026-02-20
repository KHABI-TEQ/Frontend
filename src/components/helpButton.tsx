/** @format */

import React, { FC } from 'react';
import Button from './button';

interface HelpButtonProps {
  isHomePage: boolean;
}

const HelpButton: FC<HelpButtonProps> = ({ isHomePage }) => {
  return (
    <section className='w-full flex justify-center items-center py-[40px]'>
      <Button
        type='button'
        onClick={() => {
          if (!isHomePage) {
            window.location.href = '/auth/agent';
          }
        }}
        value={`${isHomePage ? 'How Can We Help You' : 'Partner With Us'}`}
        className='h-[50px] font-bold text-[#FFFFFF] text-base w-[249px] py-[12px] px-[24px] bg-[#8DDB90] leading-[25.6px]'
      />
    </section>
  );
};

export default HelpButton;
