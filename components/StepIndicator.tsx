import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  "Thiết Lập Dự Án",
  "Phân Tích Insight",
  "Ý Tưởng Nội Dung",
  "Viết Kịch Bản",
  "Bảng Phân Cảnh",
  "Thành Phẩm Cuối"
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full">
      <ol className="flex items-center justify-between w-full text-sm font-medium text-center text-gray-500">
        {steps.slice(0, totalSteps).map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;
          
          return (
            <li
              key={label}
              className={`flex items-center ${
                stepNumber < totalSteps ? 'flex-1' : ''
              } ${
                isCompleted ? 'text-[#007dc5]' : ''
              } ${isActive ? 'text-[#007dc5]' : 'text-gray-500'} relative`}
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex items-center justify-center w-10 h-10 rounded-full ring-4 ${
                    isActive
                      ? 'bg-[#007dc5]/20 ring-[#007dc5] text-[#007dc5]'
                      : isCompleted
                      ? 'bg-[#007dc5] ring-[#007dc5] text-white'
                      : 'bg-gray-200 ring-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  ) : (
                    <span className="font-bold">{stepNumber}</span>
                  )}
                </span>
                <span className="mt-2 text-xs sm:text-sm whitespace-nowrap">{label}</span>
              </div>

              {stepNumber < totalSteps && (
                <div className="flex-auto h-1 bg-gray-200 mx-4" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};