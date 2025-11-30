/** @format */

import React, { FC, useState } from 'react';
import arrowRight from '@/svgs/arrowRight.svg';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface DetailsProps {
  heading: string;
  text: string;
  isHomepage?: boolean;
}

const Details: FC<DetailsProps> = ({ heading, text, isHomepage }) => {
  const [isViewed, setIsViewed] = useState<boolean>(false);
  return (
    <motion.div
      initial={{ y: 90, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      className={`md:py-[24px] md:px-[55px] p-[24px] flex flex-col gap-[21px] overflow-hidden ${
        isHomepage ? 'bg-[#E4EFE7]' : 'bg-[#1976D21A]'
      } transition-all duration-500`}>
      <div className='flex justify-between'>
        <h3 className='lg:text-[24px] text-[18px] leading-[20px] lg:leading-[26.4px] text-[#000000] font-semibold'>
          {heading}
        </h3>
        <Image
          src={arrowRight}
          width={25}
          height={25}
          alt=''
          onClick={() => {
            setIsViewed(!isViewed);
          }}
          className={`w-[25px] h-[25px] cursor-pointer transition-all duration-500 ${
            isViewed ? 'transform rotate-90' : 'transform rotate-270'
          }`}
        />
      </div>
      <div
        className={`transition-all duration-500 ${
          isViewed ? 'visible slide-from-bottom' : 'slide-out hidden'
        } lg:text-[21px] text-[14px] leading-[22px] tracking-[4%] md:leading-[28px] text-[#5A5D63]`}>
        {text}
      </div>
    </motion.div>
  );
};

export default Details;
