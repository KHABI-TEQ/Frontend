/** @format */

import React, { FC } from 'react';
import icon from '@/svgs/icon.svg';
import Image from 'next/image';
import { motion } from 'framer-motion';
import blueIcon from '@/svgs/blueIcon.svg';

interface HighlightUnitProps {
  title: string;
  text: string;
  isHomepage: boolean;
}

const HighlightUnit: FC<HighlightUnitProps> = ({ title, text, isHomepage }) => {
  return (
    <motion.div
      //whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      viewport={{ once: true }}
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className='py-[15px] cursor-pointer px-[24px] flex-shrink-0 lg:flex-shrink w-[366px] border-[1px] lg:py-[20px] lg:px-[32px] flex flex-col lg:gap-[16px] gap-[15px] border-[#D6DDEB]'>
      <Image
        src={isHomepage ? icon : blueIcon}
        width={42}
        height={35}
        alt=''
        className='w-[42px] h-[35px]'
      />
      <div className='flex flex-col gap-[4px] min-h-[91px]'>
        <h2
          className={`text-[24px] ${
            isHomepage ? 'text-[#09391C]' : 'text-[#1976D2]'
          } font-semibold leading-[28.8px]`}>
          {title}
        </h2>
        <span className='font-normal text-[18px] leading-[28.8px] text-[#5A5D63]'>
          {text}
        </span>
      </div>
    </motion.div>
  );
};

/**#1976D2 */

export default HighlightUnit;
