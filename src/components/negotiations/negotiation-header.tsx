"use client"

import { useNegotiationData } from "@/context/negotiation-context"
import { motion } from "framer-motion"

interface NegotiationHeaderProps {
  fullName: string
  title: string
}

function getNegotiationStatusMessage(
  status: string,
  pendingResponseFrom: 'buyer' | 'seller' | 'none',
  userRole: 'buyer' | 'seller'
): string {
  const isBuyer = userRole === 'buyer';
  const isSeller = userRole === 'seller';

  switch (status) {
    case 'pending_inspection':
      return isSeller
        ? 'The buyer has requested an inspection. Please confirm or propose a new time.'
        : 'Your inspection request is pending seller approval.';

    case 'inspection_approved':
      return 'Inspection has been approved. Prepare accordingly.';

    case 'inspection_rescheduled':
      return isBuyer
        ? 'The seller proposed a new inspection date. Please respond.'
        : 'You have rescheduled the inspection. Waiting for buyer response.';

    case 'inspection_rejected_by_seller':
      return isBuyer
        ? 'The seller has rejected the inspection request.'
        : 'You have rejected the buyer’s inspection request.';

    case 'inspection_rejected_by_buyer':
      return isSeller
        ? 'The buyer has rejected the proposed inspection.'
        : 'You have rejected the seller’s inspection proposal.';

    case 'negotiation_countered':
      if (pendingResponseFrom === 'buyer') {
        return isBuyer
          ? 'The seller has made a counter-offer. Please review and respond.'
          : 'You’ve made a counter-offer. Waiting for buyer’s response.';
      } else {
        return isSeller
          ? 'The buyer has made a counter-offer. Please review and respond.'
          : 'You’ve made a counter-offer. Waiting for seller’s response.';
      }

    case 'negotiation_accepted':
      return isBuyer
        ? 'The seller has accepted your offer. Prepare for the next steps.'
        : 'You’ve accepted the buyer’s offer. We’ve notified them.';

    case 'negotiation_rejected':
      return isBuyer
        ? 'The seller has rejected your offer.'
        : 'You have rejected the buyer’s offer.';

    case 'negotiation_cancelled':
      return isBuyer
        ? 'You have cancelled the negotiation.'
        : 'The buyer has cancelled the negotiation.';

    case 'completed':
      return 'The transaction has been completed successfully.';

    case 'cancelled':
      return 'This transaction was cancelled.';

    default:
      return 'Negotiation status is currently being processed.';
  }
}



export const NegotiationHeader = ({ fullName, title }: NegotiationHeaderProps) => {

  const { currentUserType, details } = useNegotiationData();

  return (
    <div className="flex gap-[20px] md:gap-[40px] justify-center items-center flex-col">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.2 }}
        className="font-display text-3xl md:text-4xl text-center font-semibold text-[#09391C]"
      >
        {title}
      </motion.h2>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-[1px] items-center justify-center"
      >
        <p className="text-center text-base md:text-lg text-black">
          Hi, {fullName},
        </p>
        <p className="text-center text-base md:text-lg text-black">
          {
            getNegotiationStatusMessage(
              details.negotiationStatus,
              details.pendingResponseFrom,
              currentUserType as 'buyer' | 'seller'
            )            
          }
        </p>
        <p className="text-center text-base md:text-lg text-black">
          Please reply within <span className="text-base md:text-lg text-[#FF3D00]">48 hours</span> — the countdown
          starts now.
        </p>
      </motion.div>
    </div>
  )
}
