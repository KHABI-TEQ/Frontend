import React from "react";
import Image from "next/image";
import Button from "@/components/general-components/button";
import Green from "@/assets/green.png";

interface CommissionModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  commission?: string;
  userName?: string;
}

const CommissionModal: React.FC<CommissionModalProps> = ({
  open,
  onClose,
  onAccept,
  commission = "10%",
  userName = "Emperor Ade",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white shadow-lg p-8 w-[90%] md:w-[50%] relative">
        <h2 className="text-lg sm:text-3xl font-bold text-center my-3">Commission Details</h2>
        <p className="text-center text-[#5A5D63] mb-6 text-sm sm:text-lg">
          Below is your applicable commission rate. This fee will be deducted when we close the deal
        </p>
        <div className="flex flex-col mb-6 border-[1px] border-[#A7A9A9] p-4 bg-[#F4FFF4] w-full sm:w-[65%] mx-auto ">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center self-start">
            <Image src={Green} alt="icon" width={24} height={24} />
          </div>
          <div className="flex flex-col items-center w-full">
            <div className="w-20 h-20 rounded-full bg-[#FFFFFF] flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-black">50%</span>
            </div>
            <p className="text-center text-[#1E1E1E] font-medium  text-sm sm:text-base mb-6">
              I <b>{userName}</b> agree that <b>Khabiteq realty</b> shall earn <b>50%</b> of the total commission accured to me when this deal is closed</p>
          </div>
        </div>
        <p className="text-center text-[#5A5D63] mb-6 text-xs sm:text-sm">
          Please click Yes to accept the commission policy, and let Khabiteq Realty handle the rest for you.
        </p>
        <div className="flex justify-between gap-4">
          <Button
            value="No"
            type="button"
            onClick={onClose}
            className="border-[1px] border-black lg:w-[30%] text-black text-base leading-[25.6px] font-bold min-h-[50px] py-[12px] px-[24px] disabled:cursor-not-allowed"
          />
          <Button
            value="Yes"
            type="button"
            onClick={onAccept}
            className="bg-[#8DDB90] lg:w-[30%] text-white text-base leading-[25.6px] font-bold min-h-[50px] py-[12px] px-[24px] disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default CommissionModal;