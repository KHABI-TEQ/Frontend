/** @format */

'use client';
import Image from 'next/image';
import React, { useRef } from 'react';
import bigMarkIcon from '@/svgs/bigMark.svg';
import Link from 'next/link';
import { usePageContext } from '@/context/page-context';
import useClickOutside from '@/hooks/clickOutside';
import { motion } from 'framer-motion';
import PopUpModal from './pop-up-modal-reusability';
import { useRouter } from 'next/navigation';

interface SubmitPopUpProps {
  title?: string;
  subheader?: string;
  buttonText?: string;
  href?: string;
  onClick?: () => void;
  onClose?: () => void;
}

const SubmitPopUp: React.FC<SubmitPopUpProps> = ({
  title = 'Successfully Submitted',
  subheader = 'We will be reach out to you soon',
  buttonText = 'Home',
  href = '/',
  onClick,
   onClose, 
}) => {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  // const { setIsSubmittedSuccessfully } = usePageContext();
  useClickOutside(ref, () => {
     if (onClose) onClose();
}); // Close modal on outside click
  return (
    // <motion.section className='w-full h-screen flex justify-center items-center fixed top-0 z-40 px-[20px] bg-black bg-opacity-50'>

    // </motion.section>
    <PopUpModal>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
        exit={{ y: 20, opacity: 0 }}
        ref={ref}
        className='md:w-[488px] w-full h-[374px] p-[20px] md:p-[40px] gap-[10px] bg-white shadow-md '>
        <div className='w-full h-[294px] gap-[24px] flex flex-col justify-center items-center'>
          <div className='flex flex-col min-h-[59px] gap-[10px]'>
            <h2
              className="text-[25px] text-[#202430] font-bold leading-[30px] text-center">
              {title}
            </h2>
            <p className='text-base font-normal text-[#5A5D63] leading-[19.2px] text-center'>
              {subheader}
            </p>
          </div>
          <Image
            src={bigMarkIcon}
            alt=''
            width={1000}
            height={1000}
            className='h-[121.88px] w-[121.88px]'
          />
          <Link
            href={href}
            // onClick={(e) => {
            //   e.preventDefault(); // Prevent default navigation
            //   if (onClose) onClose();
            //   router.push(href);
            //   //window.location.href = href;
            // }}
            onClick={(e) => {
              e.preventDefault();
              router.push(href);
              if (onClose) onClose();
            }}
            className={`min-h-[57px] w-full rounded-[5px] py-[14px] px-[27px] gap-[10px] bg-[#8DDB90] text-white text-[18px] leading-[28.8px] font-bold text-center text-whitespace-nowrap ${product_sans.className}`}>
            {buttonText}
          </Link>
        </div>
      </motion.div>
    </PopUpModal>
  );
};

export default SubmitPopUp;
