/** @format */
'use client';
import React from 'react';
import Counts from '../general-components/counts';
import Link from 'next/link';
import { color, motion } from 'framer-motion';
import Image from 'next/image';
import image from '@/assets/Agentpic.png';
import '@/styles/hero.css';
/**
 *
 * @returns Join our trusted network of agents and access exclusive property listings, connect with verified buyers and sellers, and grow your real estate business seamlessly
 */ 

const Section1 = () => {
  return (
    <section className='flex items-center justify-center pb-10'>
      <div className='container flex flex-col gap-[20px] items-center justify-center px-[10px] md:px-[20px] overflow-hidden'>
        <div
          style={{
            background: `linear-gradient(to right,#0B423D, #0B423D, #0B423D, #D9D9D9)`,
          }}
          className='w-full lg:w-[1200px] h-[171px] mt-10 flex justify-between'>
          <div className='flex flex-col gap-[10px] justify-center px-[15px] md:px-[30px] overflow-hidden'>
            <motion.h2
              initial={{ y: 70, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className='text-lg md:text-3xl font-bold text-white'>
              Interested in partnering with us as an agent?
            </motion.h2>
            <motion.button
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              type='button'
              className='bg-[#8DDB90] h-[40px] md:h-[50px] w-fit md:w-[207px] px-[12px] text-[14px] md:text-base font-bold text-white flex items-center justify-center'>
              <Link href={'/auth'}>Partner with us</Link>
            </motion.button>
          </div>
          <div className='w-[300px] h-full blended-image2'>
            {/* <Image
              src={image}
              width={300}
              height={300}
              className='h-full object-left-top object-cover w-[300px]'
              alt=''
            /> */}
          </div>
        </div>
        {/* <div className='md:px-[10px]  border-[2px] border-black mt-4 w-full flex flex-col gap-[24px] justify-center items-center '>
          <motion.span
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className={`font-normal lg:text-[18px] text-base leading-[25px] lg:leading-[28px] text-[#5A5D63] tracking-[5%] text-center`}>
            Your trusted partner in Lagos&apos; real estate market. Since 2020,
            we&apos;ve been delivering expert solutions with integrity and
            personalized service, helping you navigate property sales, rentals,
            and more. Let us help you find your perfect property today
          </motion.span>
        </div> */}
        {
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className={`min-h-[49px] py-2 lg:h-[72px] w-full md:px-0 lg:w-[518px] flex mt-[20px] items-center justify-center`}>
            <Counts />
          </motion.div>
        }
        <div className='lg:w-[1200px] w-full min-h-[140px] flex flex-col gap-[10px] items-center justify-center mt-[30px]'>
          <motion.h2
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className='text-[#000000] font-display text-3xl text-center'>
            About us
          </motion.h2>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className='text-[#5A5D63] text-lg text-center'>
            At Khabi-Teq Reality, we are passionate about simplifying the real
            estate journey for our clients. Since 2020, we&apos;ve been
            dedicated to helping individuals and families navigate property
            sales, rentals, and investments with ease. Our team of experienced
            professionals combines cutting-edge technology with personalized
            service to ensure you find the perfect property that meets your
            needs.
          </motion.p>
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            type='button'
            className='border-2 border-black h-[47px] md:h-[60px] w-fit md:w-[207px] px-[12px] text-[14px] md:text-base font-bold text-black flex items-center justify-center mt-4'>
            <Link href='/about_us'>Learn More</Link>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Section1;
