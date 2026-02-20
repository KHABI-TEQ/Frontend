/** @format */
'use client';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import React, { FC, useRef } from 'react';
import { motion } from 'framer-motion';
import { useVisibility } from '@/hooks/useVisibility';

interface CardProps {
  heading: string;
  image: StaticImport;
  paragraphs: string[];
}

const Card: FC<CardProps> = ({ heading, image, paragraphs }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const divRef2 = useRef<HTMLDivElement>(null);

  const isDivVisible = useVisibility(divRef);
  const isHeadingVisible = useVisibility(headingRef);
  const isParagraphVisible = useVisibility(paragraphRef);
  const isDiv2Visible = useVisibility(divRef2);

  return (
    <motion.div
      ref={divRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isDivVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className='card lg:w-[356.33px] min-h-[412px] flex flex-col gap-[10px] border-[1px] border-[#C7CAD0] bg-[#F2FFF8] p-[30px]'>
      <motion.div
        ref={divRef2}
        initial={{ opacity: 0, y: 20 }}
        animate={isDiv2Visible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3 }}
        className='w-[53px] h-[53px] rounded-[15px] bg-[#6FCF97] flex items-center justify-center'>
        <Image
          src={image}
          alt=''
          width={24}
          height={24}
          className='w-[24px] h-[24px]'
        />
      </motion.div>

      <div className='w-full lg:w-[304px] mt-6 min-h-[238px] flex flex-col gap-[15px]'>
        <motion.h2
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeadingVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className='text-[24px] leading-[28.13px] text-[#1A1D1F] font-bold'>
          {heading}
        </motion.h2>
        <hr className='w-full border-[1px] border-[#CED2D6]' />
        {paragraphs.map((paragraph: string, idx: number) => (
          <motion.p
            ref={paragraphRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isParagraphVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            key={idx}
            className='text-base leading-[25px] tracking-[3%] font-normal text-[#596066]'>
            {paragraph}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
};

export default Card;
