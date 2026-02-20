/** @format */

'use client';
import React, { Fragment, useEffect, useReducer } from 'react';
import khabiteqIcon from '@/svgs/khabi-teq.svg';
import Button from '@/components/button';
import Image from 'next/image';
import { navData } from '@/data';
import Link from 'next/link';
import barIcon from '@/svgs/bars.svg';
import { usePageContext } from '@/context/page-context';
import { reducer } from '@/hooks/reducer';
// import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import SideBar from './sideBar';

const Header = () => {
  const {
    isContactUsClicked,
    rentPage,
    isModalOpened,
    setIsModalOpened,
    viewImage,
    isSubmittedSuccessfully,
    setIsContactUsClicked,
  } = usePageContext();
  const [state, dispatch] = useReducer(reducer, navData);
  const pathName = usePathname();

  useEffect(() => {
    console.log(isModalOpened);
  }, [isModalOpened]);
  return (
    <Fragment>
      <header
        className={`w-full flex justify-center items-center py-[20px] pl-[10px] bg-[#EEF1F1] pr-[20px] ${
          (isContactUsClicked ||
            rentPage.isSubmitForInspectionClicked ||
            isModalOpened ||
            viewImage ||
            isSubmittedSuccessfully ||
            rentPage.submitPreference) &&
          'filter brightness-[30%] transition-all duration-500 overflow-hidden'
        } ${'slide-from-top'}`}
      >
        <nav className='h-[50px] container flex justify-between items-center'>
          <Image
            src={khabiteqIcon}
            width={1000}
            height={1000}
            className='md:w-[169px] md:h-[25px] w-[144px] h-[30px]'
            alt=''
          />
          <div className='lg:flex gap-[27px] hidden'>
            {state.map((item: { name: string; url: string; isClicked: boolean }, idx: number) => {
              return (
                <Link
                  key={idx}
                  href={item.url}
                  onClick={() => {
                    // e.preventDefault();
                    dispatch({
                      type: item.name,
                      name: item.name,
                    });
                  }}
                  className={` transition-all duration-500 font-medium text-[18px] leading-[21px] hover:text-[#8DDB90] ${
                    item.url === pathName ? 'text-[#8DDB90]' : 'text-[#000000]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <Button
            value="Let's talk"
            green={true}
            onClick={() => {
              setIsContactUsClicked(true);
            }}
            className='text-base text-[#FFFFFF] leading-[25px] font-bold w-[155px] h-[50px] hidden lg:inline'
          />
          <Image
            src={barIcon}
            onClick={() => {
              setIsModalOpened(!isModalOpened);
            }}
            width={35}
            height={22}
            alt=''
            className='w-[35px] h-[22px] lg:hidden'
          />
        </nav>
      </header>
      <SideBar isModalOpened={isModalOpened} setIsModalOpened={setIsModalOpened} />
    </Fragment>
  );
};

export default Header;
