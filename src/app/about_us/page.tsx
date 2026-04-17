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
  // Simulating the loading page
  const isLoading = useLoading();
  const divRef = useRef<HTMLHeadingElement>(null);
  const { isContactUsClicked, isModalOpened } = usePageContext();

  const isDivVisible = useVisibility(divRef);

  if (isLoading) return <Loading />;

  return (
    <section
      className={`w-full bg-gradient-to-br from-[#F8FAF8] via-white to-[#EEF1F1] flex justify-center items-center min-h-[1050px] pt-24 sm:pt-28 lg:pt-32 ${
        (isContactUsClicked || isModalOpened) &&
        'filter brightness-[30%] transition-all duration-500 overflow-hidden'
      }`}>
      <div className='container min-h-[1000px] flex flex-col items-center pb-[40px] overflow-hidden'>
        {/* Hero Section - Full Width Gradient Background */}
        <div className='w-full relative bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A3E72] rounded-3xl overflow-hidden mb-16'>
          {/* Background Pattern */}
          <div className='absolute inset-0 opacity-10'>
            <div className='absolute inset-0' style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
          </div>

          <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 relative z-10'>
            <div className='order-2 lg:order-1 text-left'>
              {/* Badge */}
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6'>
                <span className='w-2 h-2 rounded-full bg-[#8DDB90] animate-pulse'></span>
                <span className='text-white/90 text-sm font-medium'>Nigeria&apos;s Trusted Real Estate Platform</span>
              </div>

              <h1 className='font-display font-bold text-[36px] sm:text-[48px] lg:text-[64px] leading-[1.05] text-white mb-6'>
                Building Trust,
                <br />
                <span className='text-[#8DDB90]'>Connecting People,</span>
                <br />
                Delivering Value
              </h1>
              <p className='mt-4 text-white/80 text-lg sm:text-xl leading-relaxed max-w-xl'>
                We simplify real estate in Nigeria through transparency, innovation and excellent service. Our mission is to help you buy, sell, rent and invest with confidence.
              </p>

              {/* Stats */}
              <div className='flex flex-wrap gap-8 mt-8'>
                <div>
                  <div className='text-[#8DDB90] font-bold text-3xl sm:text-4xl font-display'>1000+</div>
                  <div className='text-white/60 text-sm'>Properties Listed</div>
                </div>
                <div>
                  <div className='text-[#8DDB90] font-bold text-3xl sm:text-4xl font-display'>500+</div>
                  <div className='text-white/60 text-sm'>Happy Clients</div>
                </div>
                <div>
                  <div className='text-[#8DDB90] font-bold text-3xl sm:text-4xl font-display'>50+</div>
                  <div className='text-white/60 text-sm'>Verified Agents</div>
                </div>
              </div>
            </div>
            <div className='order-1 lg:order-2'>
              <div className='relative group'>
                <div className='absolute -inset-4 bg-gradient-to-r from-[#8DDB90] to-[#09391C] rounded-3xl opacity-30 blur-2xl'></div>
                <img
                  src='https://cdn.builder.io/api/v1/image/assets%2F6d740e04a533428db3c439f7b515da4a%2F7ca2553702214ca8aebcb7de3b3fc643?format=webp&width=800'
                  alt='Khabiteq Realty Team'
                  className='relative w-full rounded-2xl shadow-2xl object-cover'
                />
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <div className='absolute bottom-0 left-0 right-0'>
            <svg viewBox='0 0 1440 80' fill='none' className='w-full h-auto' preserveAspectRatio='none'>
              <path d='M0 80L60 70C120 60 240 40 360 35C480 30 600 30 720 35C840 40 960 50 1080 55C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z' fill='#F8FAF8'/>
            </svg>
          </div>
        </div>

        {/* About Section */}
        <div className='w-full max-w-4xl mx-auto px-4 sm:px-6 text-center'>
          <h2 className='font-semibold lg:text-4xl lg:leading-[56px] text-[32px] leading-[40px] text-[#09391C] font-display mb-6'>
            About <span className='text-[#8DDB90] font-display'>Khabiteq</span>
          </h2>

          <p className='font-normal text-[#5A5D63] lg:text-xl text-lg text-center leading-relaxed'>
            At Khabiteq Realty, we are more than just a real estate company — we are a community builder, a lifestyle curator, and a trusted partner on your property journey. Founded with a bold vision to transform how Nigerians experience real estate, Khabiteq Realty operates at the intersection of innovation, trust, and service. Our company combines deep industry expertise with a passion for connecting people with properties that not only meet their needs but also exceed their expectations.
          </p>
        </div>

        {/* <hr className='border-[1px] w-full border-[#D9D9D9] mt-[50px]' /> */}

        <div className='flex flex-col mt-[40px] slide-from-bottom lg:px-[40px] px-[20px]'>
          {data.map((item: { heading: string; description: string }, idx) => (
            <AboutUsUnit key={idx} {...item} />
          ))}
        </div>

        <div className='flex flex-col min-h-[373px] gap-[24px] mt-[40px] lg:mt-[60px] w-full max-w-4xl lg:px-[40px] px-[20px]'>
          <h2
            className={`${'slide-from-left'} font-bold lg:text-3xl text-[28px] leading-[36px] lg:leading-[44px] text-[#09391C] text-center lg:text-left`}>
            What We Do
          </h2>
          <div className='grid sm:grid-cols-2 gap-6 mt-4'>
            {servicesData.map(
              (item: { heading: string; description: string }, idx: number) => {
                return (
                  <div
                    key={idx}
                    className='flex flex-col gap-2 p-4 bg-white/50 rounded-xl border border-[#D9D9D9]/50'>
                    <span className='text-[#0B423D] text-lg font-semibold'>
                      {item.heading}
                    </span>
                    <span className='font-normal text-[#5A5D63] text-base leading-relaxed'>
                      {item.description}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className='flex flex-col min-h-[373px] gap-[24px] mt-[40px] lg:mt-[60px] w-full max-w-4xl lg:px-[40px] px-[20px]'>
          <h2
            className={`${'slide-from-left'} font-bold lg:text-3xl text-[28px] leading-[36px] lg:leading-[44px] text-[#09391C] text-center lg:text-left`}>
            Why Choose Us?
          </h2>
          <div className='grid sm:grid-cols-2 gap-6 mt-4'>
            {reasonData.map(
              (item: { heading: string; description: string }, idx: number) => {
                return (
                  <div
                    key={idx}
                    className='flex flex-col gap-2 p-4 bg-white/50 rounded-xl border border-[#D9D9D9]/50'>
                    <span className='text-[#8DDB90] text-lg font-semibold'>
                      {item.heading}
                    </span>
                    <span className='font-normal text-[#5A5D63] text-base leading-relaxed'>
                      {item.description}
                    </span>
                  </div>
                );
              }
            )}
          </div>
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
