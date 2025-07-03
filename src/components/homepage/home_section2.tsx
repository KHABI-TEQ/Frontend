/** @format */
'use client';
import React from 'react';
import bookIcon from '@/svgs/book.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Card from './home_card';
import { motion } from 'framer-motion';
import homeIconSVG from '@/svgs/homeIcon.svg';
import userIconSVG from '@/svgs/userIcon.svg';

interface CardProps {
  heading: string;
  image: StaticImport;
  paragraphs: string[];
  color: string;
  secondaryColor: string;
  buttonText: string;
  link: string;
}

const Section2 = () => {
  return (
    <section className='w-full flex items-center justify-center py-[30px]'>
      <div className='flex flex-col gap-[37px] items-center justify-center w-full md:min-h-[490px] px-[20px] overflow-hidden'>
        <div className='flex flex-col gap-[5px] container'>
          <motion.h2
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className='text-[30px] text-[#09391C] font-display lg:leading-[41.02px] text-center font-bold'>
            Services
          </motion.h2>
          <motion.p className='text-xl text-[#000000] text-center'>
            Our comprehensive real estate solutions offers
          </motion.p>
        </div>
 
        <div className='w-full md:min-h-[412px] flex flex-wrap justify-center items-center gap-[25px] overflow-hidden'>
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
    heading: 'Property Sales',
    image: homeIconSVG,
    paragraphs: [
      'Find your dream home or investment property with our extensive listings. Benefit from expert advice and seamless transaction processes.',
    ],
    color: '#8DDB90',
    secondaryColor: '#F2FFF8',
    buttonText: 'Buy',
    link: '/market-place',
  },
  {
    heading: 'Property Rentals',
    image: homeIconSVG,
    paragraphs: [
      'Explore a wide range of rental properties tailored to your needs. Enjoy flexible leasing options and transparent terms',
    ],
    color: '#9E9E0B',
    secondaryColor: '#FFFFF2',
    buttonText: 'Rent',
    link: '/market-place',
  },
  {
    heading: 'Agent Partnership Program',
    image: userIconSVG,
    paragraphs: [
      'Join our network of trusted agents and grow your business. Gain access to exclusive tools, listings, and support',
    ],
    color: '#137ADF',
    secondaryColor: '#dbedff',
    buttonText: 'Register',
    link: '/agent',
  },
  {
    heading: 'Property Management',
    image: bookIcon,
    paragraphs: [
      'End-to-end management services for landlords and property owners. Ensure your property is well maintained and profitable',
    ],
    color: '#F9701A',
    secondaryColor: '#FFEBCA',
    buttonText: 'Contact us',
    link: '/contact-us',
  },
  {
    heading: 'Market Insights and Analytics',
    image: bookIcon,
    paragraphs: [
      'Access data-driven insights to make smarter real estate decisions. Stay ahead of trends with our expert market analysis.',
    ],
    color: '#F00952',
    secondaryColor: '#FFF2FB',
    buttonText: 'Contact us',
    link: '/contact-us',
  },
];

export default Section2;
