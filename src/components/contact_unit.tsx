/** @format */

import { archivo } from '@/styles/font';
import Image, { StaticImageData } from 'next/image';
import React, { useState, FC } from 'react';
import { ContactUnitProps } from '@/types/contact.types';



const ContactUnit: FC<ContactUnitProps> = ({ icon, value }) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setIsCopied(false);
    }
  };
  return (
    <div className='w-full md:py-[15px] md:px-[30px] py-[10px] px-[15px] h-[66px] md:h-[90px] flex justify-between bg-[#FAFAFA]'>
      <div className='flex justify-between items-center w-full'>
        <div className='flex items-center gap-[10px] md:gap-[20px]'>
          <div className='flex items-center gap-[20px] bg-white justify-center md:w-[60px] md:h-[60px] w-[46px] h-[46px] rounded-full'>
            <Image
              src={icon}
              width={1000}
              height={1000}
              alt=''
              className='w-[24px] h-[24px]'
            />
          </div>
          <h3
            className={`md:text-[18px] font-semibold md:leading-[28px] text-base leading-[25px] text-[#000000] ${archivo.className}`}>
            {value}
          </h3>
        </div>
        <button
          onClick={() => {
            copy(value);
          }}
          className='md:text-[18px] text-[#0B423D] font-bold md:leading-[28px] text-[14px] leading-[22.4px]'
          type='button'>
          {isCopied ? 'copied!' : 'copy'}
        </button>
      </div>
    </div>
  );
};

export default ContactUnit;
