/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import Clients from './clients';
import Image from 'next/image';
import arrow from '@/svgs/arrowRight.svg';
import { motion } from 'framer-motion';
import { clientData } from '@/data';

const Feedback = () => {
  const [clients, setClients] = useState(clientData);
  const [obj, setObj] = useState(clients[0]);
  const [count, setCount] = useState<number>(0);
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const [reverseAnimation, setReverseAnimation] = useState<boolean>(false);
  const totalLen: number = clients.length - 1;

  const handlePreviousSlide = () => {
    if (count === totalLen || count < 0) {
      setCount(0);
    } else {
      setCount((count: number) => count - 1);
      setReverseAnimation(true);
      setTimeout(() => {
        setReverseAnimation(false);
      }, 1000);
    }
    setObj(clients[count]);
  };

  const handleNextSlide = () => {
    if (count === clients.length - 1) {
      setCount(0);
    } else {
      setCount((count: number) => count + 1);
      setIsAnimated(true);
      setTimeout(() => {
        setIsAnimated(false);
      }, 1000);
    }
    setObj(clients[count]);
  };

  useEffect(() => {
    const timeIntervalId = setInterval(() => {
      if (count === totalLen) {
        setCount(0);
      } else {
        setCount((count: number) => count + 1);
        setIsAnimated(true);
        setTimeout(() => {
          setIsAnimated(false);
        }, 1000);
      }

      // console.log(count, clients[count]);
      setObj(clients[count]);
    }, 3000);

    return () => clearInterval(timeIntervalId);
  }, [clients, count, totalLen]);
  return (
    <section className='min-h-[359px] w-full flex justify-center items-center py-[40px] lg:py-0'>
      <div className='container min-h-[359px] flex flex-col gap-[45px] justify-center items-center px-[20px]'>
        <h2 className='md:text-[42px] text-[24px] leading-[26px] lg:leading-[46px] text-[#09391C] font-semibold'>
          What our client are saying
        </h2>
        <div className='min-h-[268px] w-full flex md:flex-row flex-col overflow-hidden'>
          <div
            className={`${isAnimated && 'slide-from-right'} ${
              reverseAnimation && 'slide-from-left'
            } w-full`}>
            <Clients {...obj} />
          </div>
          {/**Change client */}
          <div className='lg:w-[300px] flex items-end justify-end mt-8 lg:mt-0'>
            <div className='flex gap-[18px]'>
              {/**Previous */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePreviousSlide}
                className='w-[54px] h-[54px] cursor-pointer flex justify-center items-center border-[#5A5D6380] border-[1px]'>
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
                className='w-[54px] h-[54px] cursor-pointer flex justify-center items-center border-[#5A5D6380] border-[1px]'>
                <Image
                  src={arrow}
                  width={25}
                  height={25}
                  alt=''
                  className='w-[25px] h-[25px]'
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feedback;
