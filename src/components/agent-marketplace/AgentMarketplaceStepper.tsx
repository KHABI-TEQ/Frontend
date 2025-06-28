'use client';

import React from 'react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const AgentMarketplaceStepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  return (
    <div className='w-full px-4 lg:px-8 py-6'>
      <div className='flex items-center justify-between max-w-4xl mx-auto'>
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className='flex flex-col items-center'>
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${
                      isCompleted
                        ? 'bg-[#8DDB90] text-white'
                        : isActive
                        ? 'bg-[#8DDB90] text-white ring-4 ring-[#8DDB90]/30'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`mt-2 text-xs lg:text-sm text-center max-w-[80px] lg:max-w-none transition-colors
                    ${
                      isActive
                        ? 'text-[#8DDB90] font-medium'
                        : isCompleted
                        ? 'text-gray-700'
                        : 'text-gray-500'
                    }
                  `}
                >
                  {label}
                </span>
              </div>

              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 lg:mx-4 transition-colors
                    ${stepNumber < currentStep ? 'bg-[#8DDB90]' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className='mt-6 max-w-4xl mx-auto'>
        <div className='bg-gray-200 rounded-full h-2'>
          <div
            className='bg-[#8DDB90] h-2 rounded-full transition-all duration-300 ease-in-out'
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        <div className='flex justify-between text-xs text-gray-500 mt-2'>
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}% Complete</span>
        </div>
      </div>
    </div>
  );
};

export default AgentMarketplaceStepper;
