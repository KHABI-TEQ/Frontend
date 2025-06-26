/** @format */

"use client"

import { motion, AnimatePresence } from "framer-motion"
import React, { type FC } from "react"

interface NegotiationCancelledSummaryProps {
  details: any; // You might want to define a more specific type for 'details'
  currentUserType: "buyer" | "seller";
}

const NegotiationCancelledSummary: FC<NegotiationCancelledSummaryProps> = ({ details, currentUserType }) => {
  // You can still access details for user name if needed, but no other property/inspection details are typically shown here.
  const clientName = currentUserType === 'buyer' ? `${details?.clientData?.fullName || 'User'}` : `${details?.firstName || ''} ${details?.lastName || 'User'}`;

  return (
    <motion.div className="w-full flex items-center justify-center flex-col gap-[30px] md:gap-[50px] py-[40px] md:py-[60px] px-[20px] pb-[20px] bg-red-50"> {/* Light red background for cancellation */}
       <div className="flex gap-[20px] md:gap-[30px] justify-center items-center flex-col">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="font-display text-4xl md:text-5xl text-center font-bold text-gray-800 leading-tight tracking-tight"
          >
            Negotiation Cancelled <span className="text-red-500">✗</span> {/* Red X for cancellation */}
          </motion.h2>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-[8px] items-center justify-center"
          >
            <p className="text-center text-lg md:text-xl text-gray-700">
              Hello, <span className="font-semibold text-gray-800">{clientName}</span>,
            </p>
            <p className="text-center text-base md:text-lg text-gray-600 max-w-2xl px-4">
              We regret to inform you that the negotiation for this property has been cancelled.
              This could be due to various reasons.
            </p>
          </motion.div>
        </div>

      <AnimatePresence>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          exit={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-[933px] w-full flex flex-col gap-[35px] bg-white rounded-xl border border-red-100 py-[40px] md:py-[60px] md:px-[60px] px-[30px] shadow-sm"
        >
          <div className="w-full flex flex-col gap-[20px] p-4 md:p-0">
            <h3 className="text-2xl font-bold text-gray-800">Next Steps</h3>
            <div className="bg-red-50 p-6 rounded-lg border border-red-100 w-full text-center"> {/* Red-themed box */}
              <p className="text-lg text-gray-800 font-semibold mb-2">
                What you can do now:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Explore other available properties on our platform.</li>
                <li>Contact our support team if you have any questions or require further assistance.</li>
                <li>Review your dashboard for any new notifications.</li>
              </ul>
              <p className="mt-6 text-base text-gray-600 border-t pt-4 border-red-100">
                  We are here to help you find the perfect property.
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default NegotiationCancelledSummary;
