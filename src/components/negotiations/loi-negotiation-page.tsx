"use client"

import type React from "react"

import { Fragment, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { archivo } from "@/styles/font"
import { LOIDocument } from "./loi-document"
import { ActionButtons } from "../extrals/action-buttons"
import SubmitOffer from "../seller-negotiation-inspection/submit-offer"
import AcceptRejectOfferModal from "../seller-negotiation-inspection/accept-reject-offer-modal"
import { ContentTracker } from "@/types/negotiation"

interface LOINegotiationPageProps {
  letterOfIntention?: string
  setContentTracker?: (type: ContentTracker) => void
  setIsNegotiated?: (type: boolean) => void
}

export const LOINegotiationPage = ({
  letterOfIntention,
  setContentTracker,
  setIsNegotiated,
}: LOINegotiationPageProps) => {
  const [isViewed, setIsViewed] = useState<boolean>(false)
  const [contentToPass, setContentToPass] = useState<{
    heading: string
    passContent: string | React.ReactNode
    handleSubmitFunction: () => void
  } | null>(null)
  const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false)

  const AcceptOffer = () => setContentTracker?.("Confirm Inspection Date")
  const RejectOffer = () => {
    setIsNegotiated?.(true)
    setContentTracker?.("Confirm Inspection Date")
  }

  const handleButtonClick = (type: "Accept offer" | "Reject offer") => {
    setIsButtonClicked(true)
    const content = (
      <p className={`text-lg text-[#515B6F] text-center ${archivo.className}`}>
        <span className={`text-lg text-black font-semibold ${archivo.className}`}>
          Have you reviewed the submitted LOI before accepting the offer?
        </span>
        <br />
        Please note that your response will be communicated to the developer.
      </p>
    )

    setContentToPass({
      heading: type,
      passContent: content,
      handleSubmitFunction: type === "Accept offer" ? AcceptOffer : RejectOffer,
    })
  }

  return (
    <Fragment>
      <div className="w-full flex flex-col gap-[35px]">
        <div className="w-full flex flex-col">
          <p className="text-base font-semibold text-[#1976D2]">
            Note: The buyer has made a deposit to initiate this negotiation.
          </p>
          <p className="text-base font-semibold text-[#1976D2]">
            Please respond to the proposed price—whether you{" "}
            <span className="text-[#34A853] text-base font-semibold">accept</span>,{" "}
            <span className="text-[#FF2539] text-base font-semibold">reject</span>.
          </p>
          <p className="text-base font-semibold text-[#1976D2]">Your timely response is appreciated</p>
        </div>

        <LOIDocument letterOfIntention={letterOfIntention} onViewDetails={() => setIsViewed(true)} />

        <div className="h-[50px] w-full flex justify-between gap-[35px]">
          <ActionButtons
            onAccept={() => handleButtonClick("Accept offer")}
            onReject={() => handleButtonClick("Reject offer")}
            acceptLabel="Accept offer"
            rejectLabel="Reject offer"
            showNegotiate={false}
          />
        </div>
      </div>

      <AnimatePresence>
        {isViewed && <SubmitOffer />}
        {isButtonClicked && contentToPass && (
          <AcceptRejectOfferModal {...contentToPass} />
        )}
      </AnimatePresence>
    </Fragment>
  )
}
