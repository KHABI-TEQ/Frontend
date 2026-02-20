/** @format */
'use client';
import Image from 'next/image';
import React, { useReducer } from 'react';
import khabiTeqIcon from '@/svgs/white-khabi-teq.svg';
import { exploreData, iconsData, servicesData, supportData } from '@/data';
import Link from 'next/link';
import { usePageContext } from '@/context/page-context';
import ContactUs from '@/components/contactus';
import { reducer } from '@/hooks/reducer';
//import { useVisibility } from '@/utils/useVisibility';

const Footer = () => {
  const [state, dispatch] = useReducer(reducer, exploreData);
  // const footerRef = React.useRef<HTMLElement>(null);

  // const isFooterVisible = useVisibility(footerRef);
  const { isContactUsClicked, setIsContactUsClicked, rentPage, isModalOpened, viewImage, isSubmittedSuccessfully } =
    usePageContext();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
  };

  return (
    <React.Fragment>
      <footer
        className={`bg-[#0B423D] flex items-center justify-center min-h-[497px] w-full ${
          (isContactUsClicked ||
            rentPage.isSubmitForInspectionClicked ||
            isModalOpened ||
            viewImage ||
            isSubmittedSuccessfully ||
            rentPage.submitPreference) &&
          'filter brightness-[30%] transition-all duration-500 overflow-hidden'
        } ${'slide-from-left'}`}
      >
        <section className='container flex flex-col min-h-[400px] pt-[80px] pb-[20px] px-[20px]'>
          <div className='w-full flex lg:flex-row flex-col justify-between gap-[30px] md:gap-[120px]'>
            {/**Logo with some texts */}
            <div className='flex flex-col gap-[30px] lg:w-[376px] flex-wrap'>
              <Image
                src={khabiTeqIcon}
                width={1000}
                height={1000}
                alt=''
                className='lg:w-[169px] lg:h-[35px] w-[144px] h-[30px]'
              />
              <p className='font-normal lg:text-base text-[14px] leading-[25px] text-[#D6DDEB]'>
                Simplifying real estate transactions in Lagos. Buy, sell, rent, and manage properties with ease through
                Khabi-Teq&apos;s trusted platform
              </p>
            </div>
            <div className='min-h-[241px] lg:w-[806px] lg:flex lg:justify-between grid grid-cols-2 gap-[50px]'>
              {/**Explore */}
              <div className='flex flex-col gap-[10px]'>
                <h2 className='text-[18px] leading-[28px] font-semibold text-[#FFFFFF]'>Explore</h2>
                <div className='flex flex-col gap-[16px]'>
                  {state.map((item: { name: string; url: string; isClicked: boolean }, idx: number) => (
                    <Link
                      onClick={() => {
                        dispatch({
                          type: item.name,
                          name: item.name,
                        });
                      }}
                      className='lg:text-base text-[14px] leading-[22px] lg:leading-[25px] text-[#D6DDEB] font-normal'
                      key={idx}
                      href={item.url}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              {/**Services */}
              <div className='flex flex-col gap-[10px]'>
                <h2 className='text-[18px] leading-[28px] font-semibold text-[#FFFFFF]'>Services</h2>
                <div className='flex flex-col gap-[16px]'>
                  {servicesData.map((item: { name: string; url: string }, idx: number) => (
                    <Link
                      className='lg:text-base text-[14px] leading-[22px] lg:leading-[25px] text-[#D6DDEB] font-normal'
                      key={idx}
                      onClick={handleClick}
                      href={item.url}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              {/**Support */}
              <div className='flex flex-col gap-[10px]'>
                <h2 className='text-[18px] leading-[28px] font-semibold text-[#FFFFFF]'>Support</h2>
                <div className='flex flex-col gap-[16px]'>
                  {supportData.map((item: { name: string; url: string }, idx: number) => (
                    <Link
                      className='text-base leading-[25px] text-[#D6DDEB] font-normal'
                      key={idx}
                      onClick={(e) => {
                        handleClick(e);
                        if (item.name === 'Contact us') {
                          setIsContactUsClicked(true);
                        }
                      }}
                      href={item.url}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className='md:border-[2px] border-[1px] border-[#FFFFFF] mt-[100px]' />

          <div className='min-h-[70px] w-full mt-[30px] flex lg:flex-row lg:justify-between flex-col-reverse items-center gap-[30px]'>
            <span className='font-medium text-center lg:text-start text-[#FFFFFF] text-base leading-[25px]'>
              2020@ Khabiteqrealty Limited. All rights reserved.
            </span>
            <div className='flex gap-[20px]'>
              {iconsData.map((icon, idx: number) => {
                const { image, url } = icon;
                return (
                  <Link href={url} target='_blank' key={idx}>
                    <Image src={image} width={1000} height={1000} alt='' className='w-[32px] h-[32px]' />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </footer>
      {isContactUsClicked && <ContactUs />}
    </React.Fragment>
  );
};

export default Footer;
