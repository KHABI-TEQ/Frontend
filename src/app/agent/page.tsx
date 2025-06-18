/** @format */

'use client';
import React, { Fragment, useEffect } from 'react';
import HeroSection from '@/components/homepage/hero';
import Loading from '@/components/loading-component/loading';
import Section1 from '@/components/section1';
import Section3 from '@/components/homepage/section3';
import FAQs from '@/components/homepage/FAQs';
import HelpButton from '@/components/general-components/helpButton';
import { usePageContext } from '@/context/page-context';
import { useLoading } from '@/hooks/useLoading';
import agentImage from '@/assets/Agentpic.png';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import Image from 'next/image';
import { epilogue } from '@/styles/font';
import image from '@/assets/Rectangle.png';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Agent = () => {
  //Simulating the loading page
  const isLoading = useLoading();
  const router = useRouter();

  const { isContactUsClicked, isModalOpened } = usePageContext();
  const { user } = useUserContext();

  useEffect(() => {
    if (!user) {
      return;
    } else if (user.userType !== 'Agent') {
      router.push('/agent');
    } else if (!user.accountApproved) {
      router.push('/agent/under-review');
    } else {
      router.push('/agent/briefs');
    }
  }, [user, router]);

  if (isLoading) return <Loading />;

  return (
    <Fragment>
      <section
        className={`w-full  ${
          (isContactUsClicked || isModalOpened) &&
          'filter brightness-[30%] bg-[#EEF1F1] transition-all duration-500 overflow-hidden'
        }`}>
        <main className='w-full bg-[#EEF1F1]'>
          <HeroSection
            image={agentImage}
            headingText='Partner with'
            description='"Partner with Khabi-Teq for exclusive listings, referral commissions, and seamless transactions to grow your real estate business'
            buttonText1='Partner with us'
            buttonText2='Login'
            bgColor='#0A3E72'
            borderColor='#63A3BE'
            onButton1Click={() => router.push('/auth?from=agent')}
          />
          <Section1
            headingColor='#000000'
            displayCounts={false}
            text={`Join our trusted network of agents and access exclusive property listings, connect with verified buyers and sellers, and grow your real estate business seamlessly`}
          />
          {/* <div className='w-full md:h-[343px] bg-[#D9E5EE] flex justify-center items-center md:px-[40px] md:py-0 py-[30px] px-[20px]'>
            <div className='container flex md:flex-row flex-col gap-[20px] md:gap-[40px] justify-between items-end'>
              <Image
                className='lg:w-[491px] md:h-[227px] bg-[#D9D9D9] object-cover'
                src={image}
                width={491}
                height={227}
                alt='Khabiteq'
              />
              <div className='flex flex-col gap-[10px] md:gap-[20px]'>
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className='font-display text-3xl md:text-4xl font-semibold'>
                  Understand khabiteq realty partnership
                </motion.h2>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className={`${epilogue.className} text-base md:text-lg text-black font-medium`}>
                  Lorem ipsum dolor sit amet consectetur. Aenean egestas id ut
                  vitae aliquam. Ante aliquet pellentesque pellentesque id massa
                  ullamcorper.
                </motion.p>
                <motion.button
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className='w-[207px] bg-[#8DDB90] h-[50px] text-base font-bold text-white'
                  type='button'
                  onClick={() => router.push('/auth?from=agent')}>
                  Partner with us
                </motion.button>
              </div>
            </div>
          </div> */}

          <Section3
            isAgentPage={true}
            isHomepage={false}
            heading='Benefit of partnering with Khabi-teq'
            headingColor='#000000'
          />
          <FAQs isHomePage={false} headingColor='#000000' />
          <HelpButton isHomePage={false} />
        </main>
      </section>
    </Fragment>
  );
};

export default Agent;
