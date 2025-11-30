/** @format */
'use client';
import Loading from '@/components/loading-component/loading';
import { useVisibility } from '@/hooks/useVisibility';
import React, { Fragment, useRef } from 'react';
import '@/styles/stylish.modules.css';
import { data, reasonData, servicesData } from '@/data/about_us_data';
import AboutUsUnit from '@/components/aboutus_unit';
import { usePageContext } from '@/context/page-context';
import CEO from '@/components/general-components/displayCEO';
import { useLoading } from '@/hooks/useLoading';
import { AnimatePresence } from 'framer-motion';

const AboutUs = () => {
  //Simulating the loading page
  const isLoading = useLoading();
  const divRef = useRef<HTMLHeadingElement>(null);
  const { isContactUsClicked, isModalOpened } = usePageContext();

  const isDivVisible = useVisibility(divRef);

  if (isLoading) return <Loading />;

  return (
    <section
      className={`w-full bg-[#EEF1F1] flex justify-center items-center min-h-[1050px] ${
        (isContactUsClicked || isModalOpened) &&
        'filter brightness-[30%] transition-all duration-500 overflow-hidden'
      }`}>
      <div className='container min-h-[1000px] flex flex-col items-center pb-[40px] overflow-hidden'>
        {/* Hero with group image */}
        <div className='w-full mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center lg:px-[40px] px-[20px]'>
          <div className='order-2 lg:order-1 text-left'>
            <h1 className='font-display font-bold text-[28px] sm:text-[34px] lg:text-5xl leading-tight text-[#09391C]'>Building Trust, Connecting People, Delivering Value</h1>
            <p className='mt-3 text-[#5A5D63] text-base sm:text-lg'>We simplify real estate in Nigeria through transparency, innovation and excellent service. Our mission is to help you buy, sell, rent and invest with confidence.</p>
          </div>
          <div className='order-1 lg:order-2'>
            <img src='https://cdn.builder.io/api/v1/image/assets%2F6d740e04a533428db3c439f7b515da4a%2F7ca2553702214ca8aebcb7de3b3fc643?format=webp&width=800' alt='Khabiteq Realty Team' className='w-full rounded-2xl shadow-md object-cover' />
          </div>
        </div>

        {/* Divider */}
        <hr className='border-[1px] w-full border-[#D9D9D9] mt-8'/>
        <h2
          className={`min-h-[66px] font-semibold lg:text-4xl lg:leading-[66px] text-[30px] leading-[33px] text-[#000000] ${'slide-from-right'} font-display`}>
          About <span className='text-[#8DDB90] font-display'>Khabiteq</span>
        </h2>
        <p className='font-normal text-[#5A5D63] lg:text-xl text-base text-center md:mt-4 slide-from-left lg:px-[40px] px-[20px]'>
          At Khabiteq Realty, we are more than just a real estate company we are
          a community builder, a lifestyle curator, and a trusted partner on
          your property journey. Founded with a bold vision to transform how
          Nigerians experience real estate, Khabiteq Realty operates at the
          intersection of innovation, trust, and service. Our company combines
          deep industry expertise with a passion for connecting people with
          properties that not only meet their needs but also exceed their
          expectations.
        </p>
        {/* <hr className='border-[1px] w-full border-[#D9D9D9] mt-[50px]' /> */}

        <div className='flex flex-col mt-[40px] slide-from-bottom lg:px-[40px] px-[20px]'>
          {data.map((item: { heading: string; description: string }, idx) => (
            <AboutUsUnit key={idx} {...item} />
          ))}
        </div>

        <div className='flex flex-col min-h-[373px] gap-[24px] mt-[20px] lg:mt-[50px] lg:w-[870px] lg:px-[40px] px-[20px]'>
          <h2
            className={`${'slide-from-left'} font-bold lg:text-3xl text-[24px] leading-[28.13px] lg:leading-[41px] text-[#09391C]`}>
            What We Do
          </h2>
          {servicesData.map(
            (item: { heading: string; description: string }, idx: number) => {
              return (
                <div key={idx} className='flex gap-[20px]'>
                  <span className='lg:text-[20px] lg:leading-[28px] text-base leading-[22.4px] font-semibold tracking-[5%]'>
                    <span className='md:text-[#0B423D] text-[#8DDB90]'>
                      {item.heading}: &nbsp;
                    </span>
                    <span className='font-normal text-[#5A5D63]'>
                      {item.description}
                    </span>
                  </span>
                </div>
              );
            }
          )}
        </div>

        <div className='flex flex-col min-h-[373px] gap-[24px] mt-[20px] lg:mt-[50px] lg:w-[870px] lg:px-[40px] px-[20px]'>
          <h2
            className={`${'slide-from-left'} font-bold lg:text-3xl text-[24px] leading-[28.13px] lg:leading-[41px] text-[#09391C]`}>
            What Choose Us?
          </h2>
          {reasonData.map(
            (item: { heading: string; description: string }, idx: number) => {
              return (
                <div key={idx} className='flex gap-[20px]'>
                  <span className='lg:text-[20px] lg:leading-[28px] text-base leading-[22.4px] font-semibold tracking-[5%]'>
                    <span className='md:text-[#0B423D] text-[#8DDB90]'>
                      {item.heading}: &nbsp;
                    </span>
                    <span className='font-normal text-[#5A5D63]'>
                      {item.description}
                    </span>
                  </span>
                </div>
              );
            }
          )}
        </div>

        {/**CEO */}
        <div
          ref={divRef}
          className={`flex justify-center items-center mt-[60px] lg:px-[40px] px-[20px]`}>
          <AnimatePresence>
            <CEO
              name='Oladipo Onakoya'
              text='As the CEO of Khabi-Teq, my vision is to redefine real estate in Nigeria by providing seamless, transparent, and innovative solutions for all our clients. With a passion for excellence and a commitment to integrity, my goal is to build a platform that connects people to opportunities, transforms lives, and drives growth in the real estate industry'
              title='CEO/Founder'
            />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
