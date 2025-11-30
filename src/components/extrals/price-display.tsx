"use client"

import { Fragment } from "react"
import Input from "../general-components/Input"

interface PriceDisplayProps {
  amount: number
  heading: string
  subHeading: string
  viewPropertyDetails?: boolean
  onViewDetails?: () => void
}

export const PriceDisplay = ({
  amount,
  heading,
  subHeading,
  viewPropertyDetails = false,
  onViewDetails,
}: PriceDisplayProps) => {
  return (
    <Fragment>
      <div className="w-full flex flex-col gap-[15px]">
        <div className="flex md:flex-row flex-col md:items-center justify-between">
          <h2 className="text-[#1E1E1E] font-medium text-xl">{heading}</h2>
          {viewPropertyDetails && (
            <span className="text-base cursor-pointer text-[#1976D2] underline" onClick={onViewDetails}>
              view property details
            </span>
          )}
        </div>
        <Input
          label={subHeading}
          name="current_amount"
          type="text"
          value={Number(amount).toLocaleString()}
          isDisabled
        />
      </div>
    </Fragment>
  )
}
