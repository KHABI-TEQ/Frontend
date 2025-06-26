"use client"

import { Fragment, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { ActionButtons } from "../extrals/action-buttons"
import { PriceDisplay } from "../extrals/price-display"
import SubmitOffer from "../seller-negotiation-inspection/submit-offer"
import AcceptRejectOfferModal from "../seller-negotiation-inspection/accept-reject-offer-modal"
import { useNegotiationModals, useNegotiationData } from "@/context/negotiation-context"

interface NormalNegotiationPageProps {
  currentAmount: number
  buyOffer: number
}

export const NormalNegotiationPage = ({ currentAmount, buyOffer }: NormalNegotiationPageProps) => {
  const [isViewed, setIsViewed] = useState<boolean>(false)
  const [contentToPass, setContentToPass] = useState<{
    heading: string
    passContent: string
    handleSubmitFunction: () => void
  } | null>(null)
  const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false);

  const {
    showSubmitOfferModal,
    showAcceptRejectModal,
    openSubmitOfferModal,
    openAcceptRejectModal
  } = useNegotiationModals();

  const { currentUserType, details, goToNextPage, setInspectionStatus } = useNegotiationData();

  const AcceptOffer = () => {
    setInspectionStatus("accept");
    goToNextPage('Confirm Inspection Date');
  }

  const RejectOffer = () => {
    setInspectionStatus("reject");
    goToNextPage('Confirm Inspection Date');
  }

  const handleCounterOffer = () => {
    openSubmitOfferModal();
  }

  const handleButtonClick = (type: "accept" | "reject") => {
    setIsButtonClicked(true);
    openAcceptRejectModal();
  
    const content =
      type === "accept"
        ? `By accepting this offer, you agree to proceed with the buyer’s proposed terms. You will be contacted shortly to finalize the next steps.`
        : `By rejecting this offer, the buyer will be notified, and the negotiation will be closed. You may provide feedback or wait for another proposal.`;
  
    setContentToPass({
      heading: type,
      passContent: content,
      handleSubmitFunction: type === "accept" ? AcceptOffer : RejectOffer,
    });
  };  

  return (
    <Fragment>
      <div className="w-full flex flex-col gap-[35px]">
      <div className="w-full flex flex-col">
      {currentUserType === 'seller' ? (
        <>
          <p className="text-base font-semibold text-black">
            Note: The buyer has made a deposit to initiate this negotiation.
          </p>
          <p className="text-base font-semibold text-black">
            Please respond to the proposed price—whether you{" "}
            <span className="text-[#34A853] text-base font-semibold">accept</span>,{" "}
            <span className="text-[#FF2539] text-base font-semibold">reject</span>, or make a{" "}
            <span className="text-[#4285F4] text-base font-semibold">counter-offer</span>.
          </p>
          <p className="text-base font-semibold text-black">
            Your timely response is appreciated.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-black">
            Note: You've initiated this negotiation by making a deposit.
          </p>
          <p className="text-base font-semibold text-black">
            The seller will respond to your proposed price—either by{" "}
            <span className="text-[#34A853] text-base font-semibold">accepting</span>,{" "}
            <span className="text-[#FF2539] text-base font-semibold">rejecting</span>, or{" "}
            <span className="text-[#4285F4] text-base font-semibold">countering</span> it.
          </p>
          <p className="text-base font-semibold text-black">
            We’ll notify you once they respond.
          </p>
        </>
      )}
    </div>


        <div className="w-full flex flex-col justify-between gap-[25px] border-t-[1px] pt-[30px] border-[#8D9096]/[50%]">
         
          <PriceDisplay
            heading="Current property Price"
            subHeading="Current amount"
            amount={currentAmount}
            viewPropertyDetails={true}
            onViewDetails={() => setIsViewed(true)}
          />

         <PriceDisplay
            heading={
              details.negotiationStatus === 'negotiation_countered' &&
              details.pendingResponseFrom !== currentUserType
                ? 'Your negotiation price'
                : details.pendingResponseFrom === 'seller'
                  ? 'Buyer negotiation price'
                  : 'Seller negotiation price'
            }
            subHeading={
              details.negotiationStatus === 'negotiation_countered' &&
              details.pendingResponseFrom !== currentUserType
                ? 'Your Offer'
                : details.pendingResponseFrom === 'seller'
                  ? 'Buyer Offer'
                  : 'Seller Offer'
            }
            amount={buyOffer}
            viewPropertyDetails={false}
          />
        </div>

        <ActionButtons
          onAccept={() => handleButtonClick("accept")}
          onReject={() => handleButtonClick("reject")}
          onNegotiate={handleCounterOffer}
        />
      </div>

      <AnimatePresence>
        {showSubmitOfferModal && <SubmitOffer />}
        {showAcceptRejectModal && contentToPass && (
          <AcceptRejectOfferModal {...contentToPass} />
        )}
      </AnimatePresence>
    </Fragment>
  )
}
