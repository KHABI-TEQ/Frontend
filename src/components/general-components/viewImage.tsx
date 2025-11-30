/** @format */
'use client';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import arrow from '@/svgs/arrowRight.svg';
import noImage from '@/assets/noImageAvailable.png';
import cancelIcon from '@/svgs/cancelIcon.svg';
import { usePageContext } from '@/context/page-context';
import {
  StaticImageData,
  StaticImport,
} from 'next/dist/shared/lib/get-img-props';

const ViewImage = ({ imageData }: { imageData: any[] | string[] }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { setViewImage, viewImage } = usePageContext();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePreviousSlide = () => {
    const scrollableElement = scrollRef.current;
    if (scrollableElement) {
      const increment = 500;
      const newScrollPosition = Math.max(scrollPosition - increment, 0);
      scrollableElement.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
      setScrollPosition(newScrollPosition);
    }
  };

  const handleNextSlide = () => {
    const scrollableElement = scrollRef.current;
    if (scrollableElement) {
      const maxScrollPosition =
        scrollableElement.scrollWidth - scrollableElement.clientWidth;
      const increment = 500;
      const newScrollPosition = Math.min(
        scrollPosition + increment,
        maxScrollPosition
      );
      scrollableElement.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
      setScrollPosition(newScrollPosition);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (viewImage && el) {
      el.scrollTo({ left: 0 });
      setScrollPosition(0);
    }
  }, [viewImage]);

  useEffect(() => {
    const el = scrollRef.current;
    const handleScroll = () => setScrollPosition(el?.scrollLeft || 0);

    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className='w-full flex flex-col h-screen z-10 items-center justify-center bg-transparent fixed top-0 right-0 overflow-x-auto hide-scrollbar'>
      <motion.div
        ref={ref}
        initial={{ x: '900px' }}
        animate={isInView || viewImage ? { x: 0 } : { x: '900px' }}
        transition={{ delay: 0.2 }}
        className='flex items-center justify-center flex-col gap-[20px] w-full px-[10px] overflow-x-auto hide-scrollbar'>
        <div className='flex items-end justify-end w-full px-[10px]'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label='Close image viewer'
            title='Exit'
            type='button'
            onClick={() => setViewImage(false)}
            className='w-[51px] h-[51px] bg-[#FFFFFF] flex justify-center items-center rounded-full'>
            <Image
              src={cancelIcon}
              alt='Close'
              width={24}
              height={24}
              className='w-[24px] h-[24px]'
            />
          </motion.button>
        </div>

        <div
          ref={scrollRef}
          id='scrollableElement2'
          className={`w-full hide-scrollbar gap-[30px] flex ${
            imageData['length'] < 3 ? 'md:justify-center' : 'md:justify-start'
          } justify-start items-center mt-0 md:mt-10 lg:mt-0 overflow-x-scroll px-[10px] md:px-0`}>
          {imageData.length > 0 ? (
            imageData.map((image, idx: number) => {
              return (
                <div key={idx}>
                  <Image
                    src={image.url}
                    width={1000}
                    height={1000}
                    alt={`Uploaded image ${idx + 1}`}
                    className='max-w-[330px] md:max-w-[424px] h-[324px] object-cover rounded-xl'
                  />
                </div>
              );
            })
          ) : (
            <Image
              src={noImage}
              width={1000}
              height={1000}
              alt='No image available'
              className='w-[424px] h-[324px] bg-[#D9D9D9] shrink-0 object-contain'
            />
          )}
        </div>

        <div className='flex gap-[18px]'>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePreviousSlide}
            className='w-[54px] h-[54px] cursor-pointer flex justify-center items-center bg-[#FFFFFF] border-[#5A5D6380] border-[1px]'>
            <Image
              src={arrow}
              width={25}
              height={25}
              alt='Previous'
              className='w-[25px] h-[25px] transform rotate-180'
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextSlide}
            className='w-[54px] h-[54px] cursor-pointer flex justify-center items-center bg-[#FFFFFF] border-[#5A5D6380] border-[1px]'>
            <Image
              src={arrow}
              width={25}
              height={25}
              alt='Next'
              className='w-[25px] h-[25px]'
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ViewImage;
