/** @format */
'use client';
import React, { useRef } from 'react';
import bookIcon from '@/svgs/book.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Card from './home_card';
import { useVisibility } from '@/hooks/useVisibility';
import { motion } from 'framer-motion';

interface CardProps {
  heading: string;
  image: StaticImport;
  paragraphs: string[];
}

const Section2 = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const isHeadingVisible = useVisibility(headingRef);

  return (
    <section className='w-full flex items-center justify-center py-[30px]'>
      <div className='flex flex-col gap-[37px] container min-h-[490px] px-[20px] overflow-hidden'>
        <motion.h2
          ref={headingRef}
          initial={{ opacity: 0, x: 40 }}
          animate={isHeadingVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3 }}
          className='text-[35px] text-[#09391C] lg:leading-[41.02px] text-center font-bold'>
          Why Khabi-Teq Is Your Trusted Real Estate Partner
        </motion.h2>
        <div className='w-full min-h-[412px] flex justify-center items-center md:grid md:grid-cols-2 lg:flex lg:flex-row gap-[25px] flex-col'>
          {cardData.map((item: CardProps, idx: number) => (
            <Card key={idx} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

const cardData: CardProps[] = [
  {
    heading: 'For Buyers & Tenants',
    image: bookIcon,
    paragraphs: [
      'Access properties tailored to your preferences',
      'Get insights into secure and profitable areas',
      'Simplify your search with personalized recommendations ',
    ],
  },
  {
    heading: 'For Sellers & Landlords',
    image: bookIcon,
    paragraphs: [
      `Submit briefs easily and connect with verified buyers or tenants`,
      `State property usage options (JV, lease, or outright sale)`,
      `Reach the right audience with Khabi-Teq's trusted platform`,
    ],
  },
  {
    heading: 'For Developers Seeking JV',
    image: bookIcon,
    paragraphs: [
      `Partner with property owners open to Joint Ventures`,
      `Secure premium locations for development opportunities`,
      `Leverage a platform designed to connect investors and developers.`,
    ],
  },
];

export default Section2;
