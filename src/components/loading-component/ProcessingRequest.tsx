'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessingRequestProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  subTextColor?: string;
  spinner?: boolean;
}

const ProcessingRequest: React.FC<ProcessingRequestProps> = ({
  isVisible,
  title = 'Processing Request',
  message = 'Please wait while we handle your request...',
  icon,
  iconColor = '#8DDB90',
  backgroundColor = 'bg-white',
  textColor = '#24272C',
  subTextColor = '#5A5D63',
  spinner = true,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`${backgroundColor} rounded-lg p-8 max-w-sm w-full mx-4 text-center shadow-lg`}
          >
            <div className="flex flex-col items-center">
              {spinner ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className={`text-[${iconColor}] text-4xl mb-4 animate-spin`}
                />
              ) : (
                <div
                  className="text-4xl mb-4"
                  style={{ color: iconColor }}
                >
                  {icon}
                </div>
              )}
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: textColor }}
              >
                {title}
              </h3>
              <p className="text-sm" style={{ color: subTextColor }}>
                {message}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingRequest;
