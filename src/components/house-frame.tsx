/** @format */

import Image from 'next/image';
import React, { FC } from 'react';
import locationIcon from '@/svgs/location.svg';
import imgSample from '@/assets/assets.png';

interface HouseFrameProps {
  images: string[];
  title: string;
  location: string;
  bedroom?: number;
  bathroom?: number;
  carPark?: number;
  features?: { featureName: string; id: string }[];
  onClick?: () => void;
}

const HouseFrame: FC<HouseFrameProps> = ({
  title,
  location,
  bedroom,
  bathroom,
  carPark,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className='w-full min-h-[342px] flex flex-col gap-[11px] cursor-pointer'>
      <Image
        // src={
        //   images?.length !== 0 && images !== undefined ? images[0] : imgSample
        // }
        src={imgSample}
        width={1000}
        height={1000}
        alt=''
        className='lg:w-[343px] h-[222px] object-cover'
      />
      <div className='flex flex-col min-h-[109px] gap-[7px]'>
        <h2 className='lg:text-[18px] leading-[29px] font-medium text-[#000000]'>
          {title}
        </h2>
        <span className='flex gap-1 items-center'>
          <Image
            src={locationIcon}
            width={20}
            height={20}
            className='w-[16px] h-[16px]'
            alt=''
          />
          <span>{location}</span>
        </span>
        <div className='min-h-[44px] flex gap-[17px]'>
          <div className='flex flex-col border-r-[1px] pr-[10px] border-[#C7CAD0]'>
            <span className='text-[14px] leading-[22px]'>Bedroom</span>
            <span className='text-[14px] leading-[22px]'>{bedroom}</span>
          </div>
          {bathroom && (
            <div className='flex flex-col border-r-[1px] pr-[10px] border-[#C7CAD0]'>
              <span className='text-[14px] leading-[22px]'>Bathroom</span>
              <span className='text-[14px] leading-[22px]'>{bathroom}</span>
            </div>
          )}
          {carPark && (
            <div className='flex flex-col'>
              <span className='text-[14px] leading-[22px]'>Car Park</span>
              <span className='text-[14px] leading-[22px]'>{carPark}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseFrame;
