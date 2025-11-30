/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React, { FC, useEffect, useRef, useState } from 'react';
import '@/styles/newsection.css';
import arrowIcon from '@/svgs/curvedArrow.svg';
import reverseArrowIcon from '@/svgs/reverseArrow.svg';
import whiteArrowIcon from '@/svgs/whiteArrowIcon.svg';
import greenArrowIcon from '@/svgs/greenArrowIcon.svg';
import reverseWhiteArrowIcon from '@/svgs/reverseWhiteArrowIcon.svg';
import reverseGreenArrowIcon from '@/svgs/reverseGreenArrowIcon.svg';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import icon from '@/svgs/icon.svg';
import arrowRight from '@/svgs/arrowRight.svg';
import { IsMobile } from '@/hooks/isMobile';

type DisplayProps = {
  backgroundColor: string;
  heading: string;
  secondHeading: string;
  thirdHeading: string;
  description: string;
  secondDescription: string;
  thirdDescription: string;
  cardBg: string;
  secondCardBg: string;
  thirdCardBg: string;
  headingColor: string;
  secondHeadingColor: string;
  descriptionColor: string;
};

const NewSection = () => {
  const ref = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  // const [tracker, setTracker] = useState();

  const isInView = useInView(ref, { once: true });
  const isInView2 = useInView(ref2, { once: true });
  const isInView3 = useInView(ref3, { once: true });

  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  const [src, setSrc] = useState<any>(arrowIcon);
  const [reverseSrc, setReverseSrc] = useState<any>(reverseArrowIcon);
  const [display, setDisplay] = useState<DisplayProps>({
    backgroundColor: '#8DDB90',
    heading: 'Submit Your Preference',
    secondHeading: 'Match with Properties',
    thirdHeading: 'Inspect and Decide',
    description: 'Share details like location, budget, and desired feature',
    secondDescription: 'Our platform finds options that meet your criteria',
    thirdDescription: 'Choose the perfect property with ease',
    cardBg: '#F2FCF3',
    secondCardBg: '#073563',
    thirdCardBg: '#09391C',
    headingColor: '#000000',
    secondHeadingColor: '#8DDB90',
    descriptionColor: '#596066',
  });

  const handleModalToggle = (idx: number) => {
    setOpenModalIndex((prevIndex) => (prevIndex === idx ? null : idx));
  };

  useEffect(() => {
    switch (openModalIndex) {
      case 0:
        setSrc(arrowIcon);
        setDisplay({
          backgroundColor: '#8DDB90',
          heading: 'Submit Your Preference',
          secondHeading: 'Match with Properties',
          thirdHeading: 'Inspect and Decide',
          description:
            'Share details like location, budget, and desired feature',
          secondDescription:
            'Our platform finds options that meet your criteria',
          thirdDescription: 'Choose the perfect property with ease',
          cardBg: '#F2FCF3',
          secondCardBg: '#073563',
          thirdCardBg: '#09391C',
          headingColor: '#000000',
          secondHeadingColor: '#8DDB90',
          descriptionColor: '#596066',
        });
        setReverseSrc(reverseArrowIcon);
        break;
      case 1:
        setSrc(whiteArrowIcon);
        setDisplay({
          backgroundColor: '#09391C',
          heading: 'Submit Your Brief',
          secondHeading: 'Get Matched',
          thirdHeading: 'Close the Deal',
          description:
            'Add property details, usage options (JV, lease, or sale), and your contact information.',
          secondDescription:
            'We connect you with buyers, tenants, or developers.',
          thirdDescription:
            'Seamlessly finalize your transaction with our team’s support',
          cardBg: '#F2FCF3',
          secondCardBg: '#073563',
          thirdCardBg: '#8DDB90',
          headingColor: '#000000',
          secondHeadingColor: '#8DDB90',
          descriptionColor: '#596066',
        });
        setReverseSrc(reverseWhiteArrowIcon);
        break;
      case 2:
        setSrc(greenArrowIcon);
        setDisplay({
          backgroundColor: '#073563',
          heading: 'Browse Properties Open for JV',
          secondHeading: 'Connect with Sellers',
          thirdHeading: 'Build Success Together',
          description: 'Filter by location and potential project scope',
          secondDescription:
            'Start meaningful discussions about joint development',
          thirdDescription:
            'Partner on profitable projects with verified property owners',
          cardBg: '#F2FCF3',
          secondCardBg: '#8DDB90',
          thirdCardBg: '#09391C',
          headingColor: '#000000',
          secondHeadingColor: '#000000',
          descriptionColor: '#596066',
        });
        setReverseSrc(reverseGreenArrowIcon);
        break;
      default:
        setSrc(arrowIcon);
        setReverseSrc(reverseArrowIcon);
        setDisplay({
          backgroundColor: '#8DDB90',
          heading: 'Submit Your Preference',
          secondHeading: 'Match with Properties',
          thirdHeading: 'Inspect and Decide',
          description:
            'Share details like location, budget, and desired feature',
          secondDescription:
            'Our platform finds options that meet your criteria',
          thirdDescription: 'Choose the perfect property with ease',
          cardBg: '#F2FCF3',
          secondCardBg: '#073563',
          thirdCardBg: '#09391C',
          headingColor: '#000000',
          secondHeadingColor: '#8DDB90',
          descriptionColor: '#596066',
        });
        break;
    }
  }, [openModalIndex]);

  return (
    <section className='w-full flex items-center justify-center pt-[70px]'>
      <div className='container w-full flex md:flex-row justify-between flex-col min-h-[528px] gap-[64px] lg:pl-[20px] lg:pr-0 px-[20px]'>
        <div className='lg:w-[483px] w-full md:w-1/2 min-h-[496px] flex flex-col gap-[31px] overflow-hidden'>
          <h2 className='leading-[41.02px] text-[35px] text-[#09391C] font-bold'>
            How Khabi-Teq Works for You
          </h2>
          <div className='w-full flex flex-col gap-[25px]'>
            {data.map((item, idx: number) => (
              <Container
                isModalOpened={openModalIndex === idx}
                onToggle={() => handleModalToggle(idx)}
                key={idx}
                {...item}
              />
            ))}
          </div>
        </div>
        <div
          style={{ backgroundColor: `${display.backgroundColor}` }}
          className={`lg:w-[773px] w-full min-h-[377px] py-[20px] md:h-[528px] px-[20px] lg:px-0 flex flex-col gap-[20px] lg:gap-0 items-center justify-center overflow-hidden transition duration-500`}>
          {/**first card and arrow */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 80 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className='flex z-10 items-center'>
            <Card
              heading={display.heading}
              desc={display.description}
              backgroundColor={display.cardBg}
              headingColor={display.headingColor}
              descColor={display.descriptionColor}
            />
            <Image
              src={src}
              width={129}
              height={103}
              alt=''
              className='w-[129px] h-[103px] mt-[90px] hidden md:inline'
            />
          </motion.div>
          {/**second card and arrow */}
          <motion.div
            ref={ref2}
            initial={{ opacity: 0, x: -80 }}
            animate={isInView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className='flex md:flex-row-reverse md:z-10 items-center lg:ml-[200px] md:-mt-[45px]'>
            <Card
              heading={display.secondHeading}
              desc={display.secondDescription}
              backgroundColor={display.secondCardBg} /** */
              headingColor={display.secondHeadingColor} /** */
              descColor={`${openModalIndex === 2 ? '#000000' : '#ffffff'}`}
            />
            <Image
              src={reverseSrc}
              /**${
                openModalIndex === 1 ? reverseWhiteArrowIcon : reverseArrowIcon
              } ${
                openModalIndex === 2 ? reverseGreenArrowIcon : reverseArrowIcon
              } */
              width={129}
              height={103}
              alt=''
              className='w-[129px] h-[103px] mt-[90px] hidden md:inline'
            />
          </motion.div>
          {/**simply card */}
          <motion.div
            ref={ref3}
            initial={{ opacity: 0, x: 80 }}
            animate={isInView3 ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className='flex md:flex-row-reverse md:z-10 items-center lg:-ml-[100px]'>
            <Card
              heading={display.thirdHeading}
              desc={display.thirdDescription} /** */ /** */
              backgroundColor={display.thirdCardBg}
              headingColor={`${
                openModalIndex === 1 ? '#000000' : '#8DDB90'
              }`} /**000000 */
              descColor={`${
                openModalIndex === 1 ? '#000000' : '#FFFFFF'
              }`} /**#FFFFFF */ /* */
            />
          </motion.div>
          {/**Logo */}
          <div
            className={`${
              openModalIndex === 0 && 'newsec-image'
            } newsec-image ${openModalIndex === 1 && 'newsec-image-dark'} ${
              openModalIndex === 2 && 'newsec-image-blue'
            } absolute lg:w-[583px] lg:h-[500px] w-full lg:ml-[140px] lg:mt-[30px] transition duration-500 hidden md:inline`}></div>
        </div>
      </div>
    </section>
  );
};
/**
 * width: 583px;
  height: 500px;
  margin-left: 140px;
  margin-top: 30px;
 */

interface CardProps {
  heading: string;
  headingColor: string;
  desc: string;
  descColor: string;
  backgroundColor: string;
}

const Card: FC<CardProps> = ({
  heading,
  headingColor,
  desc,
  descColor,
  backgroundColor,
}) => {
  const isMobile = IsMobile();

  return (
    <motion.div
      whileHover={isMobile ? {} : { scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{ backgroundColor: backgroundColor }}
      className='lg:w-[314px] w-full min-h-[101px] cursor-pointer flex flex-col gap-[10px] p-[15px] shadow-lg shadow-[#00000040]'>
      <h2
        style={{ color: headingColor }}
        className='text-lg md:text-[20px] leading-[23.44px] font-semibold'>
        {heading}
      </h2>
      <p
        style={{ color: descColor }}
        className='text-sm md:text-base leading-[18.75px] font-normal'>
        {desc}
      </p>
    </motion.div>
  );
};

type ContainerProps = {
  heading: string;
  text: string;
  buttons: { value: string; url: string }[];
  isModalOpened: boolean;
  onToggle: () => void;
};

const Container: FC<ContainerProps> = ({
  heading,
  text,
  buttons,
  isModalOpened,
  onToggle,
}) => {
  const [isModalOpeneds, setIsModalOpened] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isContainerInView = useInView(containerRef, { once: true });

  return (
    <motion.div
      // onMouseOut={() => {
      //   setIsModalOpened(false);
      // }}
      // onMouseOver={() => {
      //   setIsModalOpened(true);
      // }}

      initial={{ opacity: 0, x: 80 }}
      animate={isContainerInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.3 }}
      ref={containerRef}
      className={`w-full min-h-[85px] overflow-hidden border-[1px] ${
        isModalOpened ? 'border-[#8DDB90]' : 'border-[#C7CAD0]'
      } bg-[#EEF1F1] p-[20px] flex flex-col gap-[20px] items-center justify-center`}>
      <div className='w-full min-h-[24px] flex items-center justify-between'>
        <div className='flex gap-[24px] items-center'>
          <Image
            src={icon}
            width={29}
            height={24}
            className='w-[29px] h-[24px]'
            alt=''
          />
          <h2 className='text-[20px] leading-[24.2px] font-semibold text-[#09391C]'>
            {heading}
          </h2>
        </div>
        <Image
          src={arrowRight}
          alt=''
          width={24}
          height={24}
          onClick={() => {
            setIsModalOpened(isModalOpened);
            onToggle();
          }}
          className={`w-[24px] h-[24px] cursor-pointer ${
            isModalOpened ? 'transform rotate-90' : 'transform rotate-0'
          } transition-all duration-500`}
        />
      </div>
      <motion.div
        initial={{ visibility: 'hidden' }}
        animate={
          isModalOpened ? { visibility: 'visible' } : { visibility: 'hidden' }
        }
        transition={{ delay: 0.3 }}
        className={`'w-full px-[30px] flex flex-col gap-[5px] ${
          isModalOpened ? 'min-h-[100px]' : 'h-0'
        }`}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isModalOpened ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={isModalOpened ? { delay: 0.2 } : { delay: 0.1 }}
          className='text-[14px] leading-[24px] tracking-[-2%] text-[#596066] font-normal'>
          {text}
        </motion.p>
        <div className='w-full flex md:flex-row flex-col gap-4'>
          {buttons.map((item: { url: string; value: string }, idx: number) => (
            <UniformButton key={idx} {...item} isModalOpened={isModalOpened} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface UniformButtonprops {
  isModalOpened: boolean;
  value: string;
  url: string;
}

const UniformButton = ({ isModalOpened, value, url }: UniformButtonprops) => {
  return (
    <motion.button
      onClick={() => {
        window.open(url, '_blank');
      }}
      initial={{ opacity: 0 }}
      animate={isModalOpened ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
      transition={isModalOpened ? { delay: 0.3 } : { delay: 0.1 }}
      className='min-h-[38px] border-[1px] py-[12px] px-[24px] border-[#09391C] min-w-[141px] text-[14px] text-[#09391C] leading-[22.4px] text-center font-medium'>
      {value}
    </motion.button>
  );
};

const data = [
  {
    heading: 'For Buyers and Tenants',
    text: `Tell us what you're looking for! Submit your preferences below and let us find the perfect match for you`,
    buttons: [
      {
        value: 'Buyer Preference',
        url: '/buy_page',
      },
      {
        value: 'Tenant Preference',
        url: '/rent_page',
      },
    ],
  },
  {
    heading: 'For Sellers and Landlords',
    text: `Tell us what you're looking for! Submit your preferences below and let us find the perfect match for you`,
    buttons: [
      {
        value: 'Seller Brief',
        url: '/sell_page',
      },
      {
        value: 'Landlords Brief',
        url: '/landlord_page',
      },
    ],
  },
  {
    heading: 'For Developers Seeking JV',
    text: `Tell us what you're looking for! Submit your preferences below and let us find the perfect match for you`,
    buttons: [
      {
        value: 'Submit Your Interest Now',
        url: '#',
      },
    ],
  },
];

export default NewSection;
