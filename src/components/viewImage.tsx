/** @format */
'use client';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import arrow from '@/svgs/arrowRight.svg';
//import image from '@/assets/assets.png';
import cancelIcon from '@/svgs/cancelIcon.svg';
import { usePageContext } from '@/context/page-context';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

const ViewImage = ({ imageData }: { imageData: (StaticImport | string)[] }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { setViewImage, viewImage } = usePageContext();
  const ref = useRef<HTMLDivElement>(null);

  const isInView = useInView(ref, { once: true });

  const handlePreviousSlide = () => {
    const scrollableElement = document.getElementById(
      'scrollableElement2'
    ) as HTMLElement;

    if (scrollableElement) {
      const maxScrollPosition =
        scrollableElement.scrollWidth - scrollableElement.clientWidth;
      const increment = 500; // The amount to scroll each time (in pixels)

      // Calculate the next scroll position
      const newScrollPosition = Math.min(
        scrollPosition - increment,
        maxScrollPosition
      );

      // Scroll the element
      scrollableElement.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });

      // Update the state with the new scroll position
      setScrollPosition(newScrollPosition);
    }
  };

  const handleNextSlide = () => {
    const scrollableElement = document.getElementById(
      'scrollableElement'
    ) as HTMLElement;

    if (scrollableElement) {
      const maxScrollPosition =
        scrollableElement.scrollWidth - scrollableElement.clientWidth;
      const increment = 500; // The amount to scroll each time (in pixels)

      // Calculate the next scroll position
      const newScrollPosition = Math.min(
        scrollPosition + increment,
        maxScrollPosition
      );

      // Scroll the element
      scrollableElement.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });

      // Update the state with the new scroll position
      setScrollPosition(newScrollPosition);
    }
  };

  return (
    <section className='w-full flex flex-col h-screen z-10 items-center justify-center bg-transparent fixed top-0 right-0'>
      <motion.div
        ref={ref}
        initial={{ x: '900px' }}
        animate={isInView || viewImage ? { x: 0 } : { x: '900px' }}
        transition={{ delay: 0.2 }}
        className='flex items-center justify-center flex-col gap-[20px] w-full'>
        <div className='flex items-end justify-end w-full px-[20px]'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title='Exit'
            type='button'
            onClick={() => {
              setViewImage(false);
            }}
            className='w-[51px] h-[51px] bg-[#FFFFFF] flex justify-center items-center rounded-full'>
            {''}
            <Image
              src={cancelIcon}
              alt=''
              width={24}
              height={24}
              className='w-[24px] h-[24px]'
            />
          </motion.button>
        </div>

        <div
          id='scrollableElement2'
          className='w-full hide-scrollbar gap-[30px] flex mt-0 md:mt-10 lg:mt-0 overflow-x-scroll'>
          {imageData.map((image, idx: number) => (
            <Image
              src={image}
              width={1000}
              height={1000}
              alt=''
              key={idx}
              className='w-[424px] h-[324px] bg-[#D9D9D9] flex-shrink-0'>
              {/* {idx} */}
            </Image>
          ))}
        </div>
        <div className='flex gap-[18px]'>
          {/**Previous */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePreviousSlide}
            className='w-[54px] h-[54px] cursor-pointer flex justify-center items-center bg-[#FFFFFF] border-[#5A5D6380] border-[1px]'>
            <Image
              src={arrow}
              width={25}
              height={25}
              alt=''
              className='w-[25px] h-[25px] transform rotate-180'
            />
          </motion.div>
          {/**Next */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextSlide}
            className='w-[54px] h-[54px] cursor-pointer flex justify-center items-center bg-[#FFFFFF] border-[#5A5D6380] border-[1px]'>
            <Image
              src={arrow}
              width={25}
              height={25}
              alt=''
              className='w-[25px] h-[25px]'
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ViewImage;
