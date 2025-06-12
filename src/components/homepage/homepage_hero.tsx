/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';
import React, { FC } from 'react';
import Image, { StaticImageData } from 'next/image';
//import houseImage from '@/assets/assets.png';
import lineStyle from '@/svgs/linestyle.svg';
import Button from '../general-components/button';
import '@/styles/hero.css';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    /**#0A3E72 */
    <section className='flex items-center justify-center w-full overflow-hidden'>
      <div className='container h-full flex md:flex-row flex-col px-[10px] md:px-[20px] '>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`w-full blended-image md:h-[470px] flex flex-col md:gap-[20px] px-[20px] lg:px-0 py-[30px] lg:py-[40px] border-[3px] justify-center items-center`}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='lg:text-[50px] font-semibold text-[40px] leading-[55px] font-display lg:leading-[130%] text-[#FFFFFF] text-center lg:text-center tracking-[2%]'>
            Find your dream{' '}
            <span className='text-[#8DDB90] font-display'>property</span>
            {' '}with ease
          </motion.h2>
          {/* <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='lg:text-[50px] font-semibold text-[40px] leading-[55px] font-display lg:leading-[66px] text-[#FFFFFF] text-start lg:text-center md:hidden'>
            Embrace The Future With
            <br />
            <span className='text-[#8DDB90] font-display'>Khabiteq</span>
          </motion.h2> */}
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
            className='font-normal lg:w-[890px] text-center lg:text-[24px] text-base md:text-[20px] lg:leading-[38.4px] leading-[25px] text-[#FFFFFF] md:my-0 my-4'>
            Buy, sell, rent or joint venture faster with expert support, smart search tools, and exclusive property listings
          </motion.p>
          {/* <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='font-normal lg:w-[890px] text-start lg:text-[24px] text-base my-4 text-[#FFFFFF] md:hidden'>
            Tell us what you&apos;re looking for! Submit your property
            preferences below and let us find the perfect match for you
          </motion.p> */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='flex items-center justify-center gap-[10px] md:gap-[27px] min-h-[66px] w-full lg:w-[604px] md:flex-row flex-col'>
            <Button
              green={true}
              className='h-[50px] md:h-[66px] w-full md:w-1/2 lg:w-[283px] py-[12px] px-[24px] text-white md:text-[20px] text-base md:leading-[32px] font-bold'
              value={'Browse Properties'}
              onClick={() => {
                window.location.href = '/market-place';
              }}
            />
            <Button
              green={true}
              className='h-[50px] md:h-[66px] w-full md:w-1/2 lg:w-[294px] py-[12px] px-[24px] text-white md:text-[20px] text-base md:leading-[32px] font-bold'
              value={'Post a Property'}
              onClick={() => {
                window.location.href = '/my_listing';
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
