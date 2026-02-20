/** @format */

import Image, { StaticImageData } from 'next/image';
import { FC, MouseEventHandler } from 'react';

interface RegisterWithProps {
  text: string;
  icon: StaticImageData;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
}

export const RegisterWith: FC<RegisterWithProps> = ({
  text,
  icon,
  onClick,
  isDisabled,
}) => {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      type='button'
      className='flex gap-[7px] items-center justify-center min-h-[60px] border-[1px] py-[24px] px-[47px] bg-[#FFFFFF] border-[#8D909680]'>
      {''}
      <Image
        src={icon}
        alt={text}
        width={24}
        height={24}
        className='w-[24px] h-[24px]'
      />
      <span className='text-[#171717] text-[14px] leading-[16.41px] font-medium tracking-[-2%]'>
        {text}
      </span>
    </button>
  );
};
