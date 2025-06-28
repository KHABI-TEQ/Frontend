'use client';

import React from 'react';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
}

const AgentMarketplaceNavigation: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  isFormValid,
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className='flex justify-between items-center px-4 lg:px-8 py-6 border-t border-[#8D909680]'>
      <div>
        {!isFirstStep && (
          <button
            type='button'
            onClick={onPrevious}
            className='flex items-center gap-2 px-6 py-3 border border-[#8D909680] text-[#1E1E1E] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isSubmitting}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Previous
          </button>
        )}
      </div>

      <div className='flex items-center gap-4'>
        {!isLastStep && (
          <button
            type='button'
            onClick={onNext}
            className='flex items-center gap-2 px-6 py-3 bg-[#8DDB90] text-white rounded-md hover:bg-[#7BC47F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!isFormValid || isSubmitting}
          >
            Next
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        )}

        {isLastStep && (
          <button
            type='button'
            onClick={onSubmit}
            className='flex items-center gap-2 px-8 py-3 bg-[#8DDB90] text-white rounded-md hover:bg-[#7BC47F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit Brief
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentMarketplaceNavigation;
