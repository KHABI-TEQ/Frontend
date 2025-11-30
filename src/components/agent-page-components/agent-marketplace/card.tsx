/** @format */

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ubuntu } from '@/styles/font';
import { PropertySelectedProps } from './types';

type CardProps = {
  object: {
    type: string;
    location: string;
    propertyPrices: number;
    landSize: string;
    documents: string[];
  };
  style?: React.CSSProperties; //just in case you need to override the default style
  isClicked?: boolean;
  setIsClicked?: (type: boolean) => void;
  propertySelected?: PropertySelectedProps;
  setPropertySelected?: (type: PropertySelectedProps) => void;
  setRenderedPage: (
    type: 'agent marketplace' | 'subscription' | 'preference'
  ) => void;
};

const Card = ({
  style,
  object,
  isClicked,
  setIsClicked,
  setPropertySelected,
  propertySelected,
  setRenderedPage,
}: CardProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      exit={{ y: 20, opacity: 0 }}
      viewport={{ once: true }}
      style={style}
      className='md:w-[266px] w-full min-h-[482px] bg-[#FFFFFF] border-[1px] border-[#D6DDEB] py-[19px] px-[15px] flex justify-center'>
      <div className='w-full h-[inherit] flex flex-col gap-[10px]'>
        <div className='flex flex-col gap-[5px]'>
          <RectangleContent heading='Type' value={object.type} />
          <RectangleContent heading='Location' value={object.location} />
          <RectangleContent
            heading='Property Prices'
            value={object.propertyPrices}
          />
          <RectangleContent heading='Landsize' value={object.landSize} />
          <RectangleContent heading='Document' value={object.documents} />
        </div>
        <div className='flex flex-col gap-[10px]'>
          <button
            onClick={() => {
              setIsClicked?.(true);
              setPropertySelected?.(propertySelected);
              setRenderedPage('preference');
            }}
            type='button'
            className='h-[37px] bg-[#F7F7F8] w-full text-[#1976D2] underline text-xs'>
            View more
          </button>
          <button
            type='button'
            className='h-[37px] w-full text-[#1AAD1F] text-sm'>
            Active
          </button>
          <button
            type='button'
            className='h-[38px] bg-[#8DDB90] w-full text-white text-sm font-bold'>
            Yes i have
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const RectangleContent = ({
  heading,
  value,
}: {
  heading: string;
  value: string | number | object;
}) => {
  return (
    <div className='bg-[#F7F7F8] h-[60px] py-[20px] px-[15px] justify-center flex flex-col gap-[6px]'>
      <h5 className={`${ubuntu.className} text-sm text-[#707281]`}>
        {heading}
      </h5>
      <h3 className='text-sm text-black font-medium'>
        {typeof value === 'number'
          ? value.toLocaleString()
          : Array.isArray(value)
            ? value.join(', ')
            : typeof value === 'object'
              ? JSON.stringify(value)
              : value}
      </h3>
    </div>
  );
};

export default Card;
