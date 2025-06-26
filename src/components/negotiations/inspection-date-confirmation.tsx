"use client"

import type React from "react"
import { Fragment, useState, useCallback, useMemo, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { archivo } from "@/styles/font"
import SubmitPopUp from "../submit"
import { DateTimeSelector } from "../extrals/date-time-selector"
import SelectPreferableInspectionDate from "../seller-negotiation-inspection/select-date-time"
import { useNegotiationActions, useNegotiationData } from '@/context/negotiation-context'
import ActionConfirmationModal from "../extrals/action-confirmation-modal"

interface InspectionDateConfirmationProps {
  potentialClientID: string
  userType: "buyer" | "seller" // New prop to determine user type
  mode?: "view" | "respond" // New prop to determine if user can respond or just view
}

type ActionType = "available" | "unavailable"

interface ModalConfig {
  heading: string
  description: string | React.ReactNode
  confirmText: string
  cancelText: string
  confirmColorClass: string
  cancelColorClass: string
  headerTextStyling?: React.CSSProperties
  onSubmit: () => void
}

interface DateTimeData {
  selectedDate: string
  selectedTime: string
}

export const InspectionDateConfirmation = ({
  potentialClientID,
  userType,
  mode = "respond"
}: InspectionDateConfirmationProps) => {
  const [activeModal, setActiveModal] = useState<ActionType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showUpdateInspectionDateModal, SetShowUpdateInspectionDateModal] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { submitBasedOnStatus } = useNegotiationActions();
  const { 
    details, 
    currentUserType,
    dateTimeObj,
    counterDateTimeObj,
    updateDateTime,
    setInspectionDateStatus,
    inspectionDateStatus,
    inspectionStatus,
    setInspectionStatus,
    resetAllToOriginal,
    isCounterDateTimeModified
  } = useNegotiationData();


  // Mock data for demonstration - replace with actual data from context
  const buyerProposedDateTime: DateTimeData = {
    selectedDate: dateTimeObj.selectedDate ?? "Dec 15, 2024",
    selectedTime: dateTimeObj.selectedTime ?? "10:00 AM"
  }

  const sellerCounteredDateTime: DateTimeData = {
    selectedDate: counterDateTimeObj?.selectedDate ?? "Dec 16, 2024",
    selectedTime: counterDateTimeObj?.selectedTime ?? "2:00 PM"
  }

  // Determine which datetime to show based on user type and inspection status
  const getCurrentDateTime = (): DateTimeData => {
    return inspectionDateStatus === "countered" ? sellerCounteredDateTime : buyerProposedDateTime
  }

  const currentDateTime = getCurrentDateTime()

  const isDisabled =
  (currentUserType === "seller" && details?.pendingResponseFrom === "buyer") ||
  (currentUserType === "buyer" && details?.pendingResponseFrom === "seller")

  const waitingUserType = currentUserType === "seller" ? "Buyer" : "Seller"

  // Memoized modal configurations
  const modalConfigs = useMemo<Record<ActionType, ModalConfig>>(() => ({
    available: {
      heading: "Available for Inspection",
      description: (
        <p className={`${archivo.className} text-lg text-[#515B6F]`}>
          Please ensure that this property is always available for inspection. If the property is unavailable,{" "}
          <span className={`${archivo.className} text-lg text-black font-semibold`}>
            your account may be flagged and restricted from using the system
          </span>
        </p>
      ),
      confirmText: "Confirm Available",
      cancelText: "Cancel",
      confirmColorClass: "bg-[#8DDB90] text-white",
      cancelColorClass: "border-[1px] border-[#FF2539] text-[#FF2539]",
      headerTextStyling: { color: "#34A853" },
      onSubmit: () => handleSubmitAction("available")
    },
    unavailable: {
      heading: "Unavailable for Inspection",
      description: (
        <p className={`${archivo.className} text-lg text-[#515B6F]`}>
          If the property is unavailable for inspection, it will be disabled from the system. You will need to
          provide evidence to reactivate it
        </p>
      ),
      confirmText: "Confirm Unavailable",
      cancelText: "Cancel",
      confirmColorClass: "bg-[#FF2539] text-white",
      cancelColorClass: "border-[1px] border-[#8DDB90] text-[#8DDB90]",
      headerTextStyling: { color: "#FF2539" },
      onSubmit: () => handleSubmitAction("unavailable")
    },
  }), [userType])

  // Handle form submission for different actions
  const handleSubmitAction = useCallback(async (actionType: ActionType) => {
    setIsSubmitting(true)
    try {
      // console.log(`Submitting action: ${actionType}`, {
      //   potentialClientID,
      //   userType,
      //   currentDateTime,
      //   actionType,
      //   inspectionStatus
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Handle success based on action type
      switch (actionType) {
        case "available":
          await submitBasedOnStatus(details.negotiationID, "available");
          break;
        case "unavailable":
          await submitBasedOnStatus(details.negotiationID, "unavailable");
          break
      }

      setSuccessMessage('success')
      
      setActiveModal(null)
    } catch (error) {
      console.error(`Error submitting ${actionType}:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }, [potentialClientID, userType, currentDateTime, setInspectionDateStatus])

  // Button click handlers
  const handleButtonClick = useCallback((actionType: ActionType) => {
    setActiveModal(actionType)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  const handleProceedButton = async () => {
    await submitBasedOnStatus(details.negotiationID, 'available');
  }

  const handleResetCounterDateTime = () => {
    resetAllToOriginal()
  }

  useEffect(() => {
    // setSuccessMessage("success")
  }, []);

  // Get notification text based on user type
  const getNotificationText = () => {
    if (userType === "seller") {
      return {
        primary: "Note: The buyer has made a deposit to initiate this negotiation.",
        secondary: "Please respond to the proposed inspection date—whether you ",
        options: [
          { text: "Available", color: "#34A853" },
          { text: "Unavailable", color: "#FF2539" },
          { text: "Update inspection", color: "#4285F4" }
        ],
        tertiary: "Your timely response is appreciated"
      }
    } else {
      return {
        primary: "Inspection date proposal from seller:",
        secondary: "Please review the proposed inspection date and choose to ",
        options: [
          { text: "Accept", color: "#34A853" },
          { text: "Counter", color: "#4285F4" }
        ],
        tertiary: "Your response will finalize the inspection scheduling"
      }
    }
  }

  const notificationText = getNotificationText()

  // Render buttons based on user type and inspection status
  const renderActionButtons = () => {
    const buttonClass = `md:w-[349px] w-full h-[50px] text-lg ${archivo.className} font-bold`
    
    if (mode === "view") {
      return null // No buttons in view mode
    }

    if (inspectionStatus !== 'countered') {
      return (
        <>
          <button
            onClick={() => handleButtonClick("available")}
            className={`${buttonClass} bg-[#8DDB90] text-white ${
              isCounterDateTimeModified() || isDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="button"
            disabled={isCounterDateTimeModified() || isDisabled}
          >
            Available
          </button>

          <button
            onClick={() => handleButtonClick("unavailable")}
            className={`${buttonClass} bg-[#FF2539] text-white ${
              isCounterDateTimeModified() || isDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="button"
            disabled={isCounterDateTimeModified() || isDisabled}
          >
            Unavailable
          </button>

          <button
            onClick={() => SetShowUpdateInspectionDateModal(true)}
            className={`${buttonClass} bg-[#000000] text-white ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="button"
            disabled={isDisabled}
          >
            Update Inspection date
          </button>
        </>
      )
    }

    return (
      <>
        <button
          onClick={() => SetShowUpdateInspectionDateModal(true)}
          className={`${buttonClass} bg-[#000000] text-white`}
          type="button"
        >
          Update Inspection date
        </button>
        <button
          onClick={handleProceedButton}
          className={`${buttonClass} bg-[#8DDB90] text-white`}
          type="button"
        >
          Proceed
        </button>
      </>
    )

  }

  // Render datetime sections
  const renderDateTimeSections = () => {
    const showBothSections = inspectionDateStatus === "countered" && (userType === "buyer" || userType === "seller");
  
    return (
      <div className="w-full flex flex-col gap-[25px]">
        {/* Buyer's Original Proposal Section */}
        <div className="w-full flex flex-col gap-[15px]">
          <div className="flex md:flex-row flex-col justify-between md:items-end">
            <h2 className="text-[#1E1E1E] text-xl font-medium">
              {userType === "seller" ? "Buyer" : "Your"} Inspection Date
            </h2>
            <span className="text-base cursor-pointer text-[#1976D2] underline">
              view property details
            </span>
          </div>
  
          <div className="w-full flex md:flex-row flex-col gap-[15px]">
            <DateTimeSelector
              heading="Select Date"
              value={buyerProposedDateTime.selectedDate}
              id="buyer_select_date"
              name="buyer_select_date"
            />
            <DateTimeSelector
              heading="Select Time"
              value={buyerProposedDateTime.selectedTime}
              id="buyer_select_time"
              name="buyer_select_time"
            />
          </div>
        </div>
  
        {/* Seller's Counter Proposal Section - Only show if countered */}
        {showBothSections && (
          <div className="w-full flex flex-col gap-[15px] border-t pt-[25px]">
            <div className="flex md:flex-row flex-col justify-between md:items-center">
              <h2 className="text-[#1E1E1E] text-xl font-medium flex items-center gap-2">
                {userType === "seller" ? "Your Counter" : "Seller's Counter"} Inspection Date
                <span className="px-2 py-1 bg-[#4285F4] text-white text-sm rounded">
                  {userType === "seller" ? "Your Proposal" : "New Proposal"}
                </span>
              </h2>
  
              {/* Reset Button */}
              <button
                onClick={handleResetCounterDateTime}
                className="text-sm text-[#D32F2F] underline mt-2 md:mt-0"
              >
                Reset Counter Date & Time
              </button>
            </div>
  
            <div className="w-full flex md:flex-row flex-col gap-[15px]">
              <DateTimeSelector
                heading="Counter Date"
                value={sellerCounteredDateTime.selectedDate}
                id="seller_select_date"
                name="seller_select_date"
              />
              <DateTimeSelector
                heading="Counter Time"
                value={sellerCounteredDateTime.selectedTime}
                id="seller_select_time"
                name="seller_select_time"
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  

  return (
    <Fragment>
      <div className="w-full flex flex-col gap-[35px]">
        {/* Notification Section */}
        <div className="w-full flex flex-col">
          <p className="text-base font-semibold text-[#0C70D3]">
            {notificationText.primary}
          </p>
          <p className="text-base font-semibold text-[#0C70D3]">
            {notificationText.secondary}
            {notificationText.options.map((option, index) => (
              <Fragment key={option.text}>
                <span 
                  className="text-base font-semibold" 
                  style={{ color: option.color }}
                >
                  {option.text}
                </span>
                {index < notificationText.options.length - 1 && (
                  <span className="text-[#0C70D3]">
                    {index === notificationText.options.length - 2 ? ", or " : ", "}
                  </span>
                )}
              </Fragment>
            ))}
            .
          </p>
          <p className="text-base font-semibold text-[#0C70D3]">
            {notificationText.tertiary}
          </p>
        </div>

        {/* DateTime Sections */}
        {renderDateTimeSections()}
        
        {/* Action Buttons */}
        {mode === "respond" && (
          <div className="pb-4">
            {isDisabled && (
              <div className="mb-4 w-full text-center text-sm md:text-base font-medium text-[#FF9800]">
                Awaiting <strong>{waitingUserType}</strong> response on this request.
              </div>
            )}
            <div className="w-full mt-6 flex flex-col gap-[10px] md:flex-row md:gap-[35px]">
              {renderActionButtons()}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* Date/Time Update Modal */}
        {showUpdateInspectionDateModal && (
          <SelectPreferableInspectionDate
            closeModal={() => SetShowUpdateInspectionDateModal(false)}
          />
        )}
 
        {/* Proceed Modal */}
        {successMessage && <SubmitPopUp />}
        
        {/* Action Confirmation Modals */}
        {activeModal && (
          <ActionConfirmationModal
            {...modalConfigs[activeModal]}
            isSubmitting={isSubmitting}
            onCancel={closeModal}
          />
        )}
      </AnimatePresence>
    </Fragment>
  )
}