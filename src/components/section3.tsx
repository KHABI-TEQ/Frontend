/** @format */

import { benefitData, HighlightData } from '@/data';
import React, { FC } from 'react';
import HighlightUnit from './hightlight-unit';

interface Section3Props {
  heading: string;
  headingColor: string;
  isHomepage: boolean;
  isAgentPage: boolean;
}

const Section3: FC<Section3Props> = ({
  heading,
  headingColor,
  isAgentPage,
  isHomepage,
}) => {
  return (
    <section className='flex lg:min-h-[614px] items-center justify-center md:py-[40px] lg:py-[40px]'>
      <div className='container py-[30px] lg:h-[614px] flex flex-col gap-[40px] justify-between items-center px-[20px]'>
        <h2
          className={`text-[${headingColor}] text-[24px] text-center lg:text-[42px] leading-[26.4px] lg:leading-[46px] font-semibold`}>
          {heading}
        </h2>
        <div className='lg:min-h-[469px] w-full gap-[30px] overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 lg:gap-[47px] flex mt-0 md:mt-10 lg:mt-6'>
          {isHomepage &&
            HighlightData.map(
              (item: { title: string; text: string }, idx: number) => (
                <HighlightUnit isHomepage={isHomepage} key={idx} {...item} />
              )
            )}
          {isAgentPage &&
            benefitData.map(
              (item: { title: string; text: string }, idx: number) => (
                <HighlightUnit isHomepage={isHomepage} key={idx} {...item} />
              )
            )}
        </div>
      </div>
    </section>
  );
};

export default Section3;
