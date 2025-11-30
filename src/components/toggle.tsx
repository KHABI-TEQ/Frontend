/** @format */

import React from 'react';

const Toggle = ({
  name,
  onClick,
  isActive,
}: {
  name: string;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  const [active, setActive] = React.useState(isActive);
  return (
    <div className='flex items-center space-x-3 h-[48px] min-w-fit py-[16px] px-[10px] rounded-[5px] border-[#E9EBEB] border-[1px]'>
      <label
        htmlFor='agent-toggle'
        className={`text-sm font-semibold text-gray-800 `}>
        {name}
      </label>
      <button
        type='button'
        title='toggle'
        id='agent-toggle'
        onClick={() => {
          setActive(!active);
          onClick?.();
        }}
        className={`w-11 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${
          active ? 'bg-teal-700' : 'bg-gray-300'
        }`}>
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
            active ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
