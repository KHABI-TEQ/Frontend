/** @format */

import Image, { StaticImageData } from 'next/image';
import { FC, MouseEventHandler } from 'react';

interface UserTypeProps {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
  bgColor?: string;
}

export const UserType: FC<UserTypeProps> = ({
  text,
  onClick,
  isDisabled,
  bgColor,
}) => {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      type='button'
      className='items-center justify-center min-h-[40px] border-[1px] py-[15px] w-full border-[#8D909680]'
      style={{backgroundColor: bgColor}}>
      <span className='text-[#171717] text-[14px] leading-[16.41px] font-medium tracking-[-2%]'>
        {text}
      </span>
    </button>
  );
};
