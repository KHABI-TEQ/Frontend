/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';
import React, { FC } from 'react';
import Image, { StaticImageData } from 'next/image';
//import houseImage from '@/assets/assets.png';
import lineStyle from '@/svgs/linestyle.svg';
import Button from './button';
import '@/styles/hero.css';
import { motion } from 'framer-motion';

// interface HeroSectionProps {
//   image: StaticImageData;
//   headingText: string;
//   description: string;
//   buttonText: string;
//   bgColor: string;
//   borderColor: string;
// }

const HeroSection = () => {
  return (
    /**#0A3E72 */
    <section className='flex items-center justify-center min-h-[536px] w-full overflow-hidden'>
      <div className='container h-full flex md:flex-row flex-col px-[20px] '>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`w-full blended-image md:h-[536px] flex flex-col gap-[20px] px-[20px] lg:px-[40px] py-[20px] lg:py-[40px] border-[3px] justify-center items-center`}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='lg:text-[50px] font-semibold text-[40px] leading-[55px] font-display lg:leading-[66px] text-[#FFFFFF] text-center lg:text-center'>
            Find the Perfect{' '}
            <span className='text-[#8DDB90] font-display'>Match</span> for Your
            Property <br className='hidden md:flex' />
            Needs -{' '}
            <span className='text-[#8DDB90] font-display'>Simplified</span>
          </motion.h2>
          <Image
            src={lineStyle}
            width={1000}
            height={1000}
            alt=''
            className='w-[455px] h-[40px]'
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='font-normal lg:w-[890px] text-center lg:text-[24px] text-[20px] lg:leading-[38.4px] leading-[25px] text-[#FFFFFF]'>
            Whether you&apos;re buying, selling, or seeking joint venture
            opportunities, Khabi-Teq connects you to tailored solutions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='flex items-center justify-center gap-[27px] min-h-[66px] w-full lg:w-[604px] md:flex-row flex-col'>
            <Button
              green={true}
              className='h-[66px] w-full md:w-1/2 lg:w-[283px] py-[12px] px-[24px] text-white text-[20px] leading-[32px] font-bold'
              value={'Submit Your Preference'}
              onClick={() => {
                window.location.href = '/buy_page';
              }}
            />
            <Button
              green={true}
              className='h-[66px] w-full md:w-1/2 lg:w-[294px] py-[12px] px-[24px] text-white text-[20px] leading-[32px] font-bold'
              value={'Submit Your Brief'}
              onClick={() => {
                window.location.href = '/auth/agent';
              }}
            />
          </motion.div>
        </motion.div>
        {/* <Image
          src={image}
          className='md:w-[50%] lg:w-[60%] w-full h-[294px] md:h-[536px] object-cover'
          alt=''
          width={1000}
          height={1000}
        /> */}
      </div>
    </section>
  );
};

export default HeroSection;
