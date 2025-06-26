/** @format */

"use client"
import React, { type FC, Fragment, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Loading from "../loading-component/loading"
import { NegotiationLayout } from "../negotiations/negotiation-layout"
import { NormalNegotiationPage } from "../negotiations/normal-negotiation-page"
import { LOINegotiationPage } from "../negotiations/loi-negotiation-page"
import { InspectionDateConfirmation } from "../negotiations/inspection-date-confirmation"
import { NegotiationProvider, useNegotiationDataWithContext, useNegotiationData } from "@/context/negotiation-context"
import NegotiationSummary from "../negotiations/negotiation-summary"
import NegotiationCancelledSummary from "../negotiations/negotiation-cancelled-summary"


interface MainEntryProps {
  potentialClientID: string
}

// Inner component that uses the context
const NegotiationContent: FC<{ potentialClientID: string }> = ({ potentialClientID }) => {

  // Use the integrated hook that automatically updates context
  const { formStatus, details, negotiationType, createdAt } = useNegotiationDataWithContext(potentialClientID, "buyer")

  const { setCurrentUserType, goToNextPage, contentTracker, setInspectionStatus } = useNegotiationData();

  // Determine initial content tracker based on data
  useEffect(() => {
    if (details && formStatus === "success") {
      const { negotiationStatus, buyOffer, letterOfIntention } = details;

      if (negotiationStatus === "negotiation_accepted" || buyOffer === 0 || negotiationStatus === "pending_inspection" || negotiationStatus === "offer_rejected") {
        setInspectionStatus(
          ['negotiation_accepted', 'pending_inspection'].includes(negotiationStatus)
            ? 'accept'
            : 'reject'
        );
        goToNextPage("Confirm Inspection Date");
      } else if (negotiationStatus === "negotiation_countered") {
        goToNextPage("Negotiation");
      } else if (letterOfIntention && letterOfIntention !== "") {
        goToNextPage("Negotiation");
      } else if (letterOfIntention === "") { // Covers the case when letterOfIntention exists but is empty
        goToNextPage("Negotiation");
      } else {
        // Fallback for any other unhandled states, or initial load if none of the above match
        goToNextPage("Negotiation");
      }
    }

    setCurrentUserType("buyer")
  }, [details, formStatus, goToNextPage, setCurrentUserType]) // Added setCurrentUserType to dependency array

  

  const renderContent = () => {
    if (!details) return null

    switch (contentTracker) {
      case "Negotiation":
        if (negotiationType === "LOI") {
          return (
            <LOINegotiationPage
              letterOfIntention={details.letterOfIntention}
            />
          )
        }
        return (
          <NormalNegotiationPage
            currentAmount={details.currentAmount}
            buyOffer={details.buyOffer}
          />
        )
      case "Confirm Inspection Date":
        return (
          <InspectionDateConfirmation
            potentialClientID={potentialClientID}
            userType="buyer"
            mode="respond"
          />
        )
      default:
        return null
    }
  }

  const renderModal = () => {
    if (formStatus === "pending") return <Loading />

    if (formStatus === "failed") {
      return (
        <div className="w-full flex items-center justify-center h-[400px]">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            exit={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            Failed to Load...
          </motion.p>
        </div>
      )
    }

    if (formStatus === "success" && details) {

      if (details.negotiationStatus === "completed") {
        return <NegotiationSummary details={details} currentUserType={'buyer'} />
      }

      if (details.negotiationStatus === "cancelled") {
        return <NegotiationCancelledSummary details={details} currentUserType="buyer" />
      }

      return (
        <NegotiationLayout
          fullName={details.clientData.fullName}
          title={contentTracker}
          createdAt={createdAt}
        >
          {renderContent()}
        </NegotiationLayout>
      )
    }

    return null
  }

  return (
    <Fragment>
      <aside className="w-full flex justify-center items-center">
        <div className="container flex items-center justify-center">
          <AnimatePresence>{renderModal()}</AnimatePresence>
        </div>
      </aside>
      
      {/* Modals - now managed by context */}
      {/* {state.showSubmitOfferModal && <SubmitOffer />}
      {state.showAcceptRejectModal && <AcceptRejectOfferModal />} */}
    </Fragment>
  )
}

// Main component with provider
const Index: FC<MainEntryProps> = ({ potentialClientID }) => {
  return (
    <NegotiationProvider>
      <NegotiationContent potentialClientID={potentialClientID} />
    </NegotiationProvider>
  )
}

export default Index