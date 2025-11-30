/** @format */

'use client';
import React, { FC } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ClientProps {
  name: string;
  text: string;
  title: string;
  starsRated?: number;
}

const CEO: FC<ClientProps> = ({ name, text, title }) => {
  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      exit={{ x: 30, opacity: 0 }}
      className='lg:w-[1007px] w-full flex md:flex-row flex-col gap-[15px] lg:gap-[60px] md:items-center'>
      <Image
        src='/CEO.webp'
        width={306}
        height={308}
        alt={'Oladipo Onakoya'}
        title='Oladipo Onakoya, CEO/Founder'
        className='md:w-[306px] w-[100%] h-[308px] bg-[#D9D9D9] object-cover object-bottom'
      />
      <div className='min-h-[157px] w-full lg:w-[562px] flex flex-col gap-[15px]'>
        <h2 className='lg:text-[36px] text-[20px] leading-[22px] lg:leading-[39px] text-[#09391C]'>
          {name}
        </h2>
        <h3 className='lg:text-[24px] lg:leading-[26px] text-[18px] leading-[20px] font-semibold text-[#5A5D63]'>
          {title}
        </h3>
        <p className='lg:text-[18px] lg:leading-[21px] text-base leading-[25.6px] font-normal flex-wrap text-[#5A5D63]'>
          {text}
        </p>
      </div>
    </motion.div>
  );
};

export default CEO;
