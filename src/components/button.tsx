/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { FC, MouseEventHandler } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  value: string;
  title?: string;
  isDisabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  green?: boolean;
  red?: boolean;
  onSubmit?: any;
}

const Button: FC<ButtonProps> = ({
  value,
  title,
  isDisabled,
  onClick,
  onSubmit,
  className,
  type,
  green,
  red,
}) => {
  return (
    <motion.button
      // whileHover={{ scale: 1.1 }}
      // whileTap={{ scale: 0.95 }}
      onSubmit={isDisabled ? undefined : onSubmit}
      title={title ? title : value}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`${className} ${
        green && 'bg-[#8DDB90] disabled:bg-[#273a28] text-white'
      } ${
        red && 'bg-[#FF3D00] disabled:bg-[#562617] text-white'
      } transition-all duration-500`}
      type={type ? type : 'button'}>
      {value}
    </motion.button>
  );
};

export default Button;
