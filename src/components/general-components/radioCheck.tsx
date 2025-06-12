/** @format */

import React, { ChangeEventHandler, FC, MouseEventHandler } from 'react';

interface RadioCheckProps {
  id?: string;
  title?: string;
  value: string;
  name: string;
  type?: 'radio' | 'checkbox';
  onClick?: MouseEventHandler<HTMLLabelElement> | undefined;
  isDisabled?: boolean;
  className?: string;
  // isChecked?: boolean | undefined;
  // setIsChecked?: (type: boolean) => void;
  handleChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  selectedValue?: string | boolean | undefined;
  isChecked?: boolean;
  modifyStyle?: React.CSSProperties;
}

const RadioCheck: FC<RadioCheckProps> = ({
  id,
  title,
  value,
  name,
  type,
  onClick,
  isDisabled,
  className,
  handleChange,
  //selectedValue
  isChecked,
  modifyStyle,
}) => {
  return (
    <label
      title={title ?? value}
      htmlFor={id}
      onClick={isDisabled ? undefined : onClick}
      className={`flex gap-[17px] cursor-pointer ${className}`}>
      {/* <input
        title={title ?? value}
        type={type}
        name={name}
        id={id}
        disabled={isDisabled}
        className='peer hidden'
        onChange={handleChange}
        //checked={selectedValue === value}
      />
      {type === 'radio' ? (
        <span className='w-[24px] h-[24px] flex items-center justify-center rounded-full border-[#5A5D63] peer-checked:bg-[#8DDB90] border-[2px]'></span>
      ) : (
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          className='peer-checked:bg-[#8DDB90] peer-checked:text-[#8DDB90]'
          xmlns='http://www.w3.org/2000/svg'>
          <rect x='0.5' y='0.5' width='23' height='23' fill='none' />
          <rect x='0.5' y='0.5' width='23' height='23' stroke='#8DDB90' />
          <path
            d='M6.66699 12L10.667 16L17.3337 8'
            stroke='white'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      )} */}
      <input
        style={{
          accentColor: '#8DDB90',
          width: '24px',
          height: '24px',
          backgroundColor: 'transparent',
        }}
        checked={isChecked}
        title={title ?? value}
        type={type}
        name={name}
        id={id}
        disabled={isDisabled}
        className='w-[24px] h-[24px] flex items-center justify-center rounded-full border-[#5A5D63] peer-checked:bg-[#8DDB90] border-[2px]'
        onChange={handleChange}
      />
      <span
        style={modifyStyle}
        dangerouslySetInnerHTML={{ __html: value }}
        className='text-base leading-[25.6px] font-normal text-[#000000]'
      />
    </label>
  );
};

/**
 *  <input
        style={{
          accentColor: '#8DDB90',
          width: '24px',
          height: '24px',
          backgroundColor: 'transparent',
        }}
        title={title ?? value}
        type={type}
        name={name}
        id={id}
        disabled={isDisabled}
        className='w-[24px] h-[24px] flex items-center justify-center rounded-full border-[#5A5D63] peer-checked:bg-[#8DDB90] border-[2px]'
        onChange={handleChange}
        //checked={selectedValue === value}
      />
 */
export default RadioCheck;
