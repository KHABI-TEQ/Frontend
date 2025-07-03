/** @format */
'use client';
import useClickOutside from '@/hooks/clickOutside';
import React, { useRef } from 'react';
import RadioCheck from '../general-components/radioCheck';
import { motion } from 'framer-motion';

interface BedroomComponentProps {
  closeModal: (type: boolean) => void;
  setNumberOfBedrooms: (type: number | undefined) => void;
  noOfBedrooms: number | undefined;
}

const BedroomComponent: React.FC<BedroomComponentProps> = ({
  closeModal,
  setNumberOfBedrooms,
  noOfBedrooms,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(divRef, () => closeModal(false));
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      ref={divRef}
      className='w-[151px] h-[262px] p-[19px] flex flex-col gap-[25px] bg-white shadow-md absolute mt-[20px]'>
      <h2 className='text-base font-medium text-[#000000]'>Bedroom</h2>
      <div className='flex flex-col gap-[10px]'>
        {Array.from({ length: 5 }).map((__, index: number) => (
          <RadioCheck
            key={index}
            type='radio'
            isChecked={index + 1 === noOfBedrooms}
            handleChange={() => setNumberOfBedrooms(index + 1)}
            value={Number(index + 1).toLocaleString()}
            name='bedroom'
          />
        ))}
      </div>
    </motion.div>
  );
};

export default BedroomComponent;
