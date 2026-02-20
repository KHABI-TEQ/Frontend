/** @format */
'use client';
import { usePageContext } from '@/context/page-context';
import React, { Fragment, ReactNode } from 'react';
import SubmitPopUp from './submit';
//import SubmitPopUp from './submit';

const Body = ({ children }: { children: ReactNode }) => {
  const { isContactUsClicked, isModalOpened, viewImage, isSubmittedSuccessfully } = usePageContext();
  return (
    <Fragment>
    <section
      className={`${
        (isContactUsClicked || isModalOpened || viewImage || isSubmittedSuccessfully) &&
        'filter brightness-[30%] bg-[#EEF1F1] transition-all duration-500 overflow-hidden'
      } w-[100%]`}>
      {children}
    </section>
    {isSubmittedSuccessfully && <SubmitPopUp/>}
    </Fragment>
  );
};

export default Body;
