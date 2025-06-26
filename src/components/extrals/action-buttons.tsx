"use client"

import { useNegotiationData } from "@/context/negotiation-context"
import { Fragment } from "react"

interface ActionButtonsProps {
  onAccept: () => void
  onReject: () => void
  onNegotiate?: () => void
  acceptLabel?: string
  rejectLabel?: string
  negotiateLabel?: string
  showNegotiate?: boolean
}

export const ActionButtons = ({
  onAccept,
  onReject,
  onNegotiate,
  acceptLabel = "Accept offer",
  rejectLabel = "Reject offer",
  negotiateLabel = "Negotiate",
  showNegotiate = true,
}: ActionButtonsProps) => {

  const { currentUserType, details } = useNegotiationData()

  const isDisabled =
    (currentUserType === "seller" && details?.pendingResponseFrom === "buyer") ||
    (currentUserType === "buyer" && details?.pendingResponseFrom === "seller")

  const waitingUserType = currentUserType === "seller" ? "Buyer" : "Seller"

  return (
    <Fragment>
      {isDisabled && (
        <div className="mb-4 w-full text-center text-sm md:text-base font-medium text-[#FF9800]">
          Awaiting <strong>{waitingUserType}</strong> response on this request.
        </div>
      )}

      <div className="w-full flex flex-wrap justify-between gap-[15px] md:gap-[35px]">
        <button
          type="button"
          onClick={onAccept}
          disabled={isDisabled}
          className={`w-[221px] h-[50px] text-base font-bold text-[#FAFAFA] transition-all duration-200 ${
            isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8DDB90] hover:bg-[#38723a]'
          }`}
        >
          {acceptLabel}
        </button>

        <button
          type="button"
          onClick={onReject}
          disabled={isDisabled}
          className={`w-[221px] h-[50px] text-base font-bold text-[#FAFAFA] transition-all duration-200 ${
            isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF3D00] hover:bg-[#993719]'
          }`}
        >
          {rejectLabel}
        </button>

        {showNegotiate && onNegotiate && (
          <button
            type="button"
            onClick={onNegotiate}
            disabled={isDisabled}
            className={`w-[221px] h-[50px] text-base font-bold text-[#FAFAFA] transition-all duration-200 ${
              isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1976D2] hover:bg-[#114d89]'
            }`}
          >
            {negotiateLabel}
          </button>
        )}
      </div>
    </Fragment>
  )
}
