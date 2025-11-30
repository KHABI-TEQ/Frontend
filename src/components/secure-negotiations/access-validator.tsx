"use client";

import React, { useEffect, useState } from "react";
import { useSecureNegotiation } from "@/context/secure-negotiations-context";
import { FiShield, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

interface AccessValidatorProps {
  userId: string;
  inspectionId: string;
  userType: "seller" | "buyer";
  children: React.ReactNode;
}

const AccessValidator: React.FC<AccessValidatorProps> = ({
  userId,
  inspectionId,
  userType,
  children,
}) => {
  const { state, validateAccess, setAccessCredentials, setCurrentUser } =
    useSecureNegotiation();
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const performValidation = async () => {
      setIsValidating(true);
      setValidationError(null);

      try {
        // Set credentials first
        setAccessCredentials(userId, inspectionId);
        setCurrentUser(userId, userType);

        // Validate access
        const isValid = await validateAccess(userId, inspectionId);

        if (!isValid) {
          setValidationError(
            "Access denied. Invalid credentials or expired link.",
          );
        }
      } catch (error) {
        console.error("Validation error:", error);
        setValidationError("Failed to validate access. Please try again.");
      } finally {
        setIsValidating(false);
      }
    };

    if (userId && inspectionId) {
      performValidation();
    }
  }, [
    userId,
    inspectionId,
    userType,
    validateAccess,
    setAccessCredentials,
    setCurrentUser,
  ]);

  const handleRetry = () => {
    setIsValidating(true);
    setValidationError(null);
    validateAccess(userId, inspectionId).finally(() => setIsValidating(false));
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <FiShield className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-20 w-20 border-2 border-green-200 border-t-green-500"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Securing Your Session
          </h2>
          <p className="text-gray-600 mb-4">
            Validating your access credentials for this negotiation...
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="animate-bounce">🔐</div>
            <span>Verifying User ID: {userId.substring(0, 8)}***</span>
          </div>
        </div>
      </div>
    );
  }

  if (validationError || !state.isValidAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            {validationError ||
              "You do not have permission to access this negotiation."}
          </p>

          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Retry Validation
            </button>

            <div className="text-sm text-gray-500 border-t pt-4">
              <p className="mb-2">If you believe this is an error:</p>
              <ul className="text-left space-y-1">
                <li>• Check that you&apos;re using the correct link</li>
                <li>• Ensure the link hasn&apos;t expired</li>
                <li>• Contact the other party for a new link</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessValidator;
