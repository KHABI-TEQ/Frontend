/** @format */

"use client"

import React, { type FC } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface NegotiationSummaryProps {
  details: any; // You might want to define a more specific type for 'details'
  currentUserType: "buyer" | "seller";
}

const NegotiationSummary: FC<NegotiationSummaryProps> = ({ details, currentUserType }) => {

  // Format inspection date for better readability
  const inspectionDate = details.inspection?.inspectionDate
    ? new Date(details.inspection.inspectionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not scheduled';

  const inspectionTime = details.inspection?.inspectionTime || 'Not scheduled';

  const initialPropertyPrice = details.currentAmount;
  const finalAcceptedPrice = details.buyOffer > 0 ? details.buyOffer : details.currentAmount; // Corrected logic

  const location = details.propertyData?.location;
  const propertyType = details.propertyData?.propertyType;

  return (
    <motion.div className="w-full flex items-center justify-center flex-col gap-[30px] md:gap-[50px] py-[40px] md:py-[60px] px-[20px] pb-[20px] bg-gray-50"> {/* Very light background */}
       <div className="flex gap-[20px] md:gap-[30px] justify-center items-center flex-col">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="font-display text-4xl md:text-5xl text-center font-bold text-gray-800 leading-tight tracking-tight" // Sharper, cleaner text
          >
            Offer Accepted! <span className="text-green-500">✓</span>
          </motion.h2>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-[8px] items-center justify-center"
          >
            <p className="text-center text-lg md:text-xl text-gray-700">
              Hello, <span className="font-semibold text-gray-800">{currentUserType === 'buyer' ? `${details.clientData.fullName}` : `${details.firstName} ${details.lastName}`}</span>,
            </p>
            <p className="text-center text-base md:text-lg text-gray-600 max-w-2xl px-4">
              Fantastic news! Your negotiation for this property has been successfully completed. Here’s a summary of the agreed terms and your upcoming inspection details.
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
          className="lg:w-[933px] w-full flex flex-col gap-[35px] bg-white rounded-xl border border-gray-100 py-[40px] md:py-[60px] md:px-[60px] px-[30px] shadow-sm" // Minimal shadow
        >

          <div className="w-full flex flex-col gap-[35px] p-4 md:p-0"> {/* Adjusted padding */}
            {/* Price display section */}
            <div className="w-full flex flex-col justify-between gap-[25px] pb-[30px] border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Price Summary</h3> {/* General heading */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Display Initial Property Price */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-700">Initial Property Price</p>
                        <p className="text-3xl font-extrabold text-blue-800 mt-2">₦{initialPropertyPrice.toLocaleString()}</p>
                    </div>

                    {/* Display Final Accepted Price */}
                    <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-green-700">
                            {currentUserType === 'buyer' ? "Your Accepted Price" : "Final Accepted Price"}
                        </p>
                        <p className="text-3xl font-extrabold text-green-800 mt-2">₦{finalAcceptedPrice.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Inspection and Property Details Section */}
            <div className="w-full flex flex-col gap-[20px] pt-[20px]">
              <h3 className="text-2xl font-bold text-gray-800">Your Upcoming Inspection</h3>
              <div className="bg-white p-6 rounded-lg border border-gray-100 w-full"> {/* Lighter border */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-500">Inspection Date:</p>
                    <p className="text-lg text-gray-800 font-semibold mt-1">{inspectionDate}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-500">Inspection Time:</p>
                    <p className="text-lg text-gray-800 font-semibold mt-1">{inspectionTime}</p>
                  </div>
                  {location && (
                    <div className="flex flex-col col-span-1 md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Property Location:</p>
                      <p className="text-lg text-gray-800 font-semibold mt-1">
                        {location.area}, {location.localGovernment}, {location.state}
                      </p>
                    </div>
                  )}
                  {propertyType && (
                    <div className="flex flex-col col-span-1 md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Property Type:</p>
                      <p className="text-lg text-gray-800 font-semibold mt-1">{propertyType}</p>
                    </div>
                  )}
                </div>
                <p className="mt-6 text-base text-gray-600 border-t pt-4 border-gray-100">
                    Please ensure you are available at the scheduled time. For any changes or queries, kindly contact support.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default NegotiationSummary;