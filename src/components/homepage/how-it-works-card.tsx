/** @format */

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  heading: string;
  detailsArr: string[];
}

const Card = ({ heading, detailsArr }: CardProps) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', WebkitBackdropFilter: 'blur(5px)' }}
      className='w-full sm:w-[280px] md:w-[313px] h-[389px] shrink-0 flex flex-col justify-center items-center gap-[10px] py-[24px] px-[18px] border-[1px] border-[#FFFFFFFF] bg-white/5 backdrop-blur-md'>
      <div className='w-full h-full flex flex-col gap-[27px] items-center'>
        <h2 className='font-semibold text-xl text-white'>{heading}</h2>
        <hr className='w-full border-[1px] border-[#FFFFFF]' />
        <div className='w-full h-[264px] flex flex-col gap-[12px]'>
          {detailsArr?.map((item: string, idx: number) => (
            <Rectangle key={idx} index={idx} text={item} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Rectangle = ({ index, text }: { index: number; text: string }) => {
  return (
    <div className='w-full h-[57px] py-[10px] px-[15px] flex items-center gap-[14px] border-[1px] border-white backdrop-blur-md bg-white/5'>
      <div className='flex items-center justify-center w-[27px] h-[27px] bg-[#0B423D] text-white text-lg'>
        {index + 1}
      </div>
      <span className='text-base text-white'>{text}</span>
    </div>
  );
};

export default Card;
