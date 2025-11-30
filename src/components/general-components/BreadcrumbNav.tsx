/** @format */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BreadcrumbNavProps {
  point: string;
  onBack: () => void;
  arrowIcon: string;
  backText?: string;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  point,
  onBack,
  arrowIcon,
  backText,
}) => (
  <div className='flex gap-1 items-center px-[10px] lg:px-[0px]'>
    <Image
      alt=''
      src={arrowIcon}
      width={24}
      height={24}
      className='w-[24px] h-[24px] cursor-pointer'
      onClick={onBack}
    />
    <div className='flex gap-2 items-center justify-center align-middle'>
      <Link
        href='#'
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
        className='text-base md:text-lg text-[#25324B] font-normal'>
        {backText}
      </Link>
      <h3 className='text-base md:text-lg text-[#25324B] font-semibold'>
        .&nbsp;{point}
      </h3>
    </div>
  </div>
);

export default BreadcrumbNav;
