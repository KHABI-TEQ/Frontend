"use client"

import Image from "next/image"
import sampleImg from "@/assets/Agentpic.png"

interface LOIDocumentProps {
  letterOfIntention?: string
  onViewDetails?: () => void
}

export const LOIDocument = ({ letterOfIntention, onViewDetails }: LOIDocumentProps) => {
  return (
    <div className="w-full flex flex-col gap-[10px] md:gap-[25px] pt-[10px]">
      <div className="flex justify-between items-center">
        <h2 className="text-base md:text-xl text-[#1E1E1E] font-medium">LOI Document</h2>
        <span className="text-sm md:text-base cursor-pointer text-[#1976D2] underline" onClick={onViewDetails}>
          view property details
        </span>
      </div>
      <div className="flex md:flex-row flex-col gap-[15px] justify-between items-start">
        <h3 className="text-sm md:text-base font-semibold text-[#202430]">
          Developer LOI document: kindly click on the document before you
          <br />
          Accept or reject offer
        </h3>
        <div className="flex flex-col relative w-[80px] h-[57px]">
          <a href={letterOfIntention || "#"} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <Image
              src={letterOfIntention || sampleImg}
              className="w-[80px] h-[57px] object-cover"
              alt="LOI Document"
              width={80}
              height={57}
            />
            <p className="absolute left-1 bottom-1 text-[8px] text-slate-700 px-2 py-1 rounded">View details</p>
          </a>
        </div>
      </div>
    </div>
  )
}
