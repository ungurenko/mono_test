import React from 'react';
import { AppStatus } from '../types';

interface ProgressBarProps {
  status: AppStatus;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ status }) => {
  const steps = [
    { id: AppStatus.ANALYZING, label: 'Анализ текста' },
    { id: AppStatus.STRUCTURING, label: 'Создание конспекта' },
    { id: AppStatus.GENERATING_PDF, label: 'Генерация PDF' },
  ];

  // Determine current active index
  let activeIndex = -1;
  if (status === AppStatus.ANALYZING) activeIndex = 0;
  if (status === AppStatus.STRUCTURING) activeIndex = 1;
  if (status === AppStatus.REVIEW) activeIndex = 1; // Stay full at step 2 during review
  if (status === AppStatus.GENERATING_PDF) activeIndex = 2;
  if (status === AppStatus.COMPLETED) activeIndex = 3;

  return (
    <div className="w-full max-w-lg mt-8 space-y-4">
      <div className="flex justify-between items-center px-2">
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCurrent = (index === activeIndex) && (status !== AppStatus.REVIEW);
          
          return (
            <div key={index} className="flex flex-col items-center gap-2 transition-all duration-500">
              <div 
                className={`
                  w-4 h-4 rounded-full transition-all duration-500
                  ${isActive ? 'bg-mono-lavender scale-125 shadow-[0_0_15px_rgba(230,230,250,1)]' : 'bg-gray-100'}
                  ${isCurrent ? 'animate-pulse' : ''}
                `}
              />
              <span className={`
                text-xs font-semibold tracking-wide transition-colors duration-500
                ${isActive ? 'text-mono-text' : 'text-gray-300'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Background track */}
      <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden relative">
         {/* Moving gradient bar */}
         <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-mono-lavender to-mono-powder transition-all duration-1000 ease-in-out rounded-full"
            style={{ 
              width: activeIndex === -1 ? '0%' : activeIndex >= 2 ? '100%' : `${(activeIndex + 1) * 33}%` 
            }}
         />
      </div>
    </div>
  );
};

export default ProgressBar;