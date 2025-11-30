/** @format */
'use client';
import { section1Data } from '@/data';
import React, { Fragment } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'framer-motion';

const Counts = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <Fragment>
      {section1Data.map(
        (item: { name: string; count: number }, idx: number) => {
          const { name, count } = item;
          return (
            <section key={idx}>
              <div
                ref={ref}
                className={`flex flex-col gap-[1px] justify-between border-r-[2px] pl-[10px] pr-[5px] md:pr-[30px] ${
                  idx === section1Data.length - 1 ? 'border-none' : ''
                }`}>
                <h2 className='text-[#0B423D] font-bold text-[18px] lg:text-[28px] leading-[28px] lg:leading-[44px]'>
                  {isInView && (
                    <div className='flex'>
                      {' '}
                      <CountUp
                        start={0}
                        end={count}
                        duration={2}
                        separator=','
                      />{' '}
                      +
                    </div>
                  )}
                </h2>
                <span className='text-[#5A5D63] text-[12px] leading-[19.2px] lg:text-base lg:leading-[26px] font-normal'>
                  {name}
                </span>
              </div>
            </section>
          );
        }
      )}
    </Fragment>
  );
};

export default Counts;
