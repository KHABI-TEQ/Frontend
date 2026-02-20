/** @format */

'use client';
import { usePageContext } from '@/context/page-context';
import { AgentNavData } from '@/enums';
import React, { Fragment } from 'react';

const AgentNav = () => {
  const { selectedNav, setSelectedNav } = usePageContext();

  const handleSelect = (text: string) => {
    setSelectedNav(text);
  };

  return (
    <Fragment>
      <div className='min-h-[51px] hidden md:flex gap-[20px] flex-wrap flex-row justify-center items-center'>
        {navData.map((item: string, idx: number) => (
          <Box
            selectedText={selectedNav}
            onClick={() => {
              handleSelect(item);
            }}
            key={idx}
            name={item}
          />
        ))}
      </div>
      <div className='min-h-[51px] md:hidden flex gap-[20px] flex-col justify-center items-center w-full'>
        <Box
          selectedText={selectedNav}
          className='w-full bg-[#09391C] text-[#8DDB90]'
          onClick={() => {
            handleSelect('Create Brief');
          }}
          name={'Create Brief'}
        />
        <div className='flex gap-[10px] overflow-x-scroll w-full hide-scrollbar'>
          {navData.map((item: string, idx: number) => {
            if (idx >= 1) {
              return (
                <Box
                  className='min-w-fit'
                  selectedText={selectedNav}
                  onClick={() => {
                    handleSelect(item);
                  }}
                  key={idx}
                  name={item}
                />
              );
            }
          })}
        </div>
      </div>
    </Fragment>
  );
};

const {
  CREATE_BRIEF,
  OVERVIEW,
  TOTAL_BRIEF,
  DRAFT_BRIEF,
  TRANSACTION_HISTORY,
  SETTINGS,
} = AgentNavData;

const navData: string[] = [
  CREATE_BRIEF,
  OVERVIEW,
  TOTAL_BRIEF,
  DRAFT_BRIEF,
  TRANSACTION_HISTORY,
  SETTINGS,
];

interface BoxProps {
  name: string;
  onClick: () => void;
  isDisabled?: boolean;
  selectedText: string;
  className?: string;
}

const Box: React.FC<BoxProps> = ({
  name,
  onClick,
  isDisabled,
  selectedText,
  className,
}) => {
  return (
    <button
      type='button'
      onClick={isDisabled ? undefined : onClick}
      className={`${className} ${
        selectedText === name
          ? 'bg-[#09391C] text-[#8DDB90] shadow-md'
          : 'text-[#5A5D63] bg-transparent'
      } text-[18px] leading-[21.09px] transition-all duration-500 font-semibold py-[15px] px-[20px] gap-[10px] border-[1px] border-[#C7CAD0] border-sm lg:min-w-[202px] hover:bg-[#8DDB90] hover:text-[#FFFFFF]`}>
      {name}
    </button>
  );
};

export default AgentNav;
