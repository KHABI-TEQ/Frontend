"use client"

import { Fragment } from "react"

interface DateTimeSelectorProps {
  heading: "Select Date" | "Select Time" | "Counter Date" | "Counter Time"
  value: string
  id: string
  name: string
  onClick?: () => void
}

export const DateTimeSelector = ({ id, heading, value, name, onClick }: DateTimeSelectorProps) => {
  return (
    <Fragment>
      <label htmlFor={id} className="flex flex-col gap-[4px]">
        <h5 className="text-base font-medium text-[#1E1E1E]">{heading}</h5>
        <input
          type="text"
          readOnly
          onClick={onClick}
          value={value}
          name={name}
          className="w-[183px] cursor-pointer py-[16px] px-[12px] bg-[#FAFAFA] border-[1px] border-[#D6DDEB] text-base text-[#000000] font-semibold"
        />
      </label>
    </Fragment>
  )
}
