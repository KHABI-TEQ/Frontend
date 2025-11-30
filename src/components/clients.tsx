/** @format */
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';

interface ClientProps {
  name: string;
  text: string;
  starsRated: number;
}

const Clients: FC<ClientProps> = ({ name, text, starsRated }) => {
  return (
    <div className='lg:min-w-[928px] w-full flex md:flex-row flex-col gap-[20px] lg:gap-[60px] md:items-center'>
      <div className='md:w-[306px] w-[100%] h-[268px] bg-[#D9D9D9]'></div>
      <div className='h-[157px] w-full lg:w-[562px] flex flex-col gap-[15px] flex-wrap'>
        <h2 className='lg:text-[36px] text-[24px] leading-[26.4px] lg:leading-[39px] text-[#09391C]'>
          {name}
        </h2>
        <p className='text-[18px] leading-[21px] font-normal flex-wrap text-[#5A5D63]'>
          {text}
        </p>
        <div className='flex gap-[12px]'>
          {Array.from({ length: starsRated }).map((__, idx: number) => (
            <FontAwesomeIcon
              icon={faStar}
              key={idx}
              width={24}
              height={24}
              className='lg:w-[24px] lg:h-[24px] w-[16px] h-[16px]'
              color={'#E5C50C'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clients;
