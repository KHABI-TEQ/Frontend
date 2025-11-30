"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiClock, FiRefreshCw } from "react-icons/fi";

interface AwaitingResponseDisplayProps {
  userType: "seller" | "buyer";
  pendingResponseFrom: "seller" | "buyer" | "admin";
  timeRemaining: string;
}

const AwaitingResponseDisplay: React.FC<AwaitingResponseDisplayProps> = ({
  userType,
  pendingResponseFrom,
  timeRemaining,
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getWaitingMessage = () => {
    if (pendingResponseFrom === "admin") {
      return `Awaiting admin review${dots}`;
    }
    const otherParty = pendingResponseFrom === "seller" ? "seller" : "buyer";
    return `Awaiting response from ${otherParty}${dots}`;
  };

  const isAwaitingAdmin = pendingResponseFrom === "admin";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-[#C7CAD0]"
      >
        <div className="p-6 sm:p-8 text-center">
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-6 border-4 border-blue-300"
          >
            <FiClock className="w-10 h-10 text-blue-600" />
          </motion.div>

          {/* Waiting Message */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#09391C] mb-4">
            {getWaitingMessage()}
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              ✓ Your response has been submitted successfully!
              <br />
              {isAwaitingAdmin
                ? "Your submission is being reviewed by our admin team."
                : "The other party will be notified and has time to respond."}
            </p>
          </div>

          {/* Timer Display - Hidden for admin state */}
          {!isAwaitingAdmin && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="p-2 bg-yellow-200 rounded-full">
                  <FiClock className="w-5 h-5 text-yellow-700" />
                </div>
                <span className="font-semibold text-yellow-800 text-sm sm:text-base">
                  Response Timer
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">
                {timeRemaining || "Loading..."}
              </div>
              <div className="text-sm sm:text-base text-yellow-700">
                remaining for {pendingResponseFrom} to respond
              </div>
            </div>
          )}

          {/* Admin Review Display */}
          {isAwaitingAdmin && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="p-2 bg-purple-200 rounded-full">
                  <FiClock className="w-5 h-5 text-purple-700" />
                </div>
                <span className="font-semibold text-purple-800 text-sm sm:text-base">
                  Under Admin Review
                </span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-purple-600 mb-2">
                Processing Review
              </div>
              <div className="text-sm sm:text-base text-purple-700">
                Our team is reviewing your submission. You will be notified once
                the review is complete.
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div
            className={`grid gap-4 mb-6 ${isAwaitingAdmin ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}
          >
            <div className="p-3 rounded-lg border bg-green-50 border-green-200">
              <div className="text-sm font-medium text-gray-700 mb-1">You</div>
              <div className="text-sm text-green-600">✓ Responded</div>
            </div>

            {!isAwaitingAdmin && (
              <div
                className={`p-3 rounded-lg border ${
                  pendingResponseFrom !== userType
                    ? "bg-gray-50 border-gray-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {pendingResponseFrom === "seller" ? "Seller" : "Buyer"}
                </div>
                <div
                  className={`text-sm ${
                    pendingResponseFrom !== userType
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {pendingResponseFrom !== userType ? "✓ Responded" : "Pending"}
                </div>
              </div>
            )}

            {isAwaitingAdmin && (
              <>
                <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {userType === "seller" ? "Buyer" : "Seller"}
                  </div>
                  <div className="text-sm text-gray-600">✓ Responded</div>
                </div>
                <div className="p-3 rounded-lg border bg-purple-50 border-purple-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Admin
                  </div>
                  <div className="text-sm text-purple-600">🔍 Reviewing</div>
                </div>
              </>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#09391C] text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Check for Updates</span>
          </button>

          {/* Additional Info */}
          <div className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
              What happens next?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              {isAwaitingAdmin ? (
                <>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Admin team is reviewing your submission</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      You&apos;ll receive notification when review is complete
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Processing typically takes 24-48 hours</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Refresh to check for updates</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      The {pendingResponseFrom} has {timeRemaining} to respond
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      You&apos;ll receive a notification when they respond
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Negotiation may expire if no response</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Refresh to check for updates</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AwaitingResponseDisplay;
