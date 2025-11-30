/** @format */

'use client';
import React from 'react';
import 'ldrs/react/Trio.css';
import { Trio } from 'ldrs/react';

const Loading = () => {
  return (
    <section className='h-screen w-full flex items-center justify-center'>
      <Trio size={50} speed={1.3} color='#09391C' />
    </section>
  );
};

export default Loading;
