/** @format */

'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import HeaderLogic from '@/logic/headerLogic';
import Footer from './footer';

import { ReactNode } from 'react';
import ViewImage from './viewImage';
import { usePageContext } from '@/context/page-context';

interface Props {
  children: ReactNode;
}

export default function HeaderFooterWrapper({ children }: Props) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const { viewImage, imageData } = usePageContext();
  return (
    <Fragment>
      {!isAdminRoute && <HeaderLogic />}
      {children}
      {!isAdminRoute && <Footer />}
      {viewImage && <ViewImage imageData={imageData} />}
    </Fragment>
  );
}
