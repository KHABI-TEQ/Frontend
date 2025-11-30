/** @format */

import Image, { StaticImageData } from "next/image";
import { FC, MouseEventHandler } from "react";

interface RegisterWithProps {
  text: string;
  icon: StaticImageData;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
}

export const RegisterWith: FC<RegisterWithProps> = ({
  text,
  icon,
  onClick,
  isDisabled,
}) => {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      type="button"
      disabled={isDisabled}
      className={`flex gap-[12px] w-full items-center justify-center min-h-[60px] border-[1px] py-[16px] px-[18px] bg-[#FFFFFF] border-[#D6DDEB] rounded-lg transition-all duration-300 hover:border-[#8DDB90] hover:shadow-md hover:bg-[#8DDB90]/5 ${
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <Image
        src={icon}
        alt={text}
        width={20}
        height={20}
        className="w-[20px] h-[20px]"
      />
      <span className="text-[#171717] text-[15px] leading-[20px] font-medium">
        {text}
      </span>
    </button>
  );
};
