/** @format */
'use client';
import { usePageContext } from '@/context/page-context';
import React, { Fragment, ReactNode, useState } from 'react';
import SubmitPopUp from '../submit';
import OnUpgradeNotification from '../settings-components/on-ugrade-notification';
import AuthGuard from '../common/AuthGuard';
//import SubmitPopUp from './submit';

const Body = ({ children }: { children: ReactNode }) => {
  // const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const {
    isContactUsClicked,
    isModalOpened,
    viewImage,
    isSubmittedSuccessfully,
    settings,
    dashboard,
  } = usePageContext();
  return (
    <AuthGuard>
      <Fragment>
        <section
          className={`${
            (isContactUsClicked ||
              isModalOpened ||
              viewImage ||
              isSubmittedSuccessfully ||
              settings.isUpgradeButtonClicked ||
              dashboard.approveBriefsTable.isApproveClicked ||
              dashboard.approveBriefsTable.isDeleteClicked ||
              dashboard.approveBriefsTable.isRejectClicked) &&
            'filter brightness-[30%] bg-[#EEF1F1] transition-all duration-500 overflow-hidden'
          } w-[100%]`}>
          {children}
        </section>
        {isSubmittedSuccessfully && <SubmitPopUp />}
        {settings.isUpgradeButtonClicked && <OnUpgradeNotification />}
        {dashboard.approveBriefsTable.isApproveClicked && (
          <>lorem add</>
        )}
        {dashboard.approveBriefsTable.isRejectClicked && (
          <>Lorem, ipsum.</>
        )}
        {dashboard.approveBriefsTable.isDeleteClicked && (
          <>Lorem ipsum dolor sit amet.</>
        )}
      </Fragment>
    </AuthGuard>
  );
};

export default Body;
