/** @format */

'use client';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Loading = () => {
  return (
    <section className='h-screen w-full flex items-center justify-center'>
      <FontAwesomeIcon
        icon={faSpinner}
        spin
        width={30}
        height={30}
        className='w-[50px] h-[50px]'
      />
    </section>
  );
};

export default Loading;
