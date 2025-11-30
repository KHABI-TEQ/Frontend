/** @format */
'use client';
import { usePageContext } from '@/context/page-context';
import useClickOutside from '@/hooks/clickOutside';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { contactUsData } from '@/data';
import ContactUnit from './contact_unit';
import { StaticImageData } from 'next/image';

const ContactUs = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  const { setIsContactUsClicked } = usePageContext();

  useClickOutside(ref, () => setIsContactUsClicked(false));

  return (
    <section className='fixed z-20 top-0 h-screen w-full justify-center items-center flex px-[20px]'>
      <div
        ref={ref}
        className={`md:w-[550px] min-h-[312px] w-full flex flex-col slide-from-bottom`}>
        <div className='h-[60px] bg-transparent flex justify-end'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsContactUsClicked(false);
            }}
            className='w-[51px] h-[51px] bg-white shadow-md flex justify-center items-center rounded-full'>
            <FontAwesomeIcon
              icon={faClose}
              width={24}
              height={24}
              className='w-[24px] h-[24px]'
            />
          </motion.button>
        </div>
        <div className='bg-white min-h-[510px] rounded-[4px] md:py-[80px] md:px-[40px] py-[40px] px-[24px] flex items-center justify-center gap-[25px]'>
          <div className='md:w-[511px] w-full h-[475px] flex flex-col gap-[42px]'>
            <div className='min-h-[123px] flex flex-col justify-center items-center gap-[4px]'>
              <h2 className='font-bold text-[24px] leading-[40px] md:text-[28px] md:leading-[40px] text-[#0B0D0C]'>
                Contact Us
              </h2>
              <p className='font-normal text-base leading-[25px] md:text-[18px] md:leading-[25px] text-[#515B6F] text-center tracking-[0.15px]'>
                Have questions or need assistance? We&apos;re here to help!
                Reach out to us anytime, and our team will get back to you as
                soon as possible
              </p>
            </div>
            <div className='h-[310px] flex flex-col gap-[20px]'>
              {contactUsData.map(
                (
                  item: { value: string; icon: StaticImageData; type: string },
                  idx: number
                ) => (
                  <ContactUnit key={idx} {...item} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
