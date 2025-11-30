/** @format */

'use client';
import { usePageContext } from '@/context/page-context';
import React from 'react';
import ChangePassword from './change-password';
import AddressInformation from './address-information';
import ContactDetails from './contact-details';
import Upgrade from './upgrade';

const Mainbar = () => {
  const { settings } = usePageContext();

  const renderDynamically = () => {
    switch (settings.selectedNav) {
      case 'Change Password':
        return <ChangePassword />;
      case 'Address':
        return <AddressInformation />;
      case 'Contact':
        return <ContactDetails />;
      case 'Upgrade':
        return <Upgrade />;
      default:
        return <ChangePassword />;
    }
  };
  return (
    <div className='lg:w-[730px]'>
      {settings.selectedNav && renderDynamically()}
    </div>
  );
};

export default Mainbar;
