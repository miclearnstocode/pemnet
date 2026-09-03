'use client';

import { useState, useEffect } from 'react';

const steps = [
  {
    id: 1,
    title: "Submit your abstract",
    description: "Share your project, results, and learning with interested colleagues."
  },
  {
    id: 2,
    title: "Complete your paper",
    description: "Expand your abstract into a full paper and submit your final version."
  },
  {
    id: 3,
    title: "Share the learning",
    description: "Present your findings and contribute to the collective knowledge pool."
  }
];

export default function SequentialSteps() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Use a recursive setTimeout to avoid any stale closure issues
    let timeoutId: NodeJS.Timeout;

    const runTimer = () => {
      timeoutId = setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
        runTimer(); // Schedule the next one
      }, 2500);
    };

    runTimer();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="space-y-8">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-6">
            
            {/* Left Column: Indicators & Lines */}
            <div className="flex flex-col items-center">
              
              {/* Number Badge */}
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                  transition-all duration-500 ease-in-out
                  ${isActive 
                    ? 'bg-blue-800 text-white shadow-md scale-105 border border-transparent' 
                    : 'bg-white text-slate-500 border border-slate-300 scale-100'
                  }
                `}
              >
                {String(step.id).padStart(2, '0')}
              </div>

              {/* Connecting Line (Only if not the last step) */}
              {!isLast && (
                <div className="relative w-px h-24 bg-slate-200 my-2 overflow-hidden">
                  {/* The filling line segment */}
                  <div 
                    key={isActive ? 'active' : 'inactive'}
                    className={`
                      absolute top-0 left-0 w-full bg-blue-600 
                      ${isActive ? 'animate-fill-line' : 'h-0'}
                    `} 
                  />
                </div>
              )}
            </div>

            {/* Right Column: Text Content */}
            <div 
              className={`
                pt-1 transition-all duration-500 ease-in-out
                ${isActive ? 'opacity-100 transform translate-x-0' : 'opacity-50 transform -translate-x-1'}
              `}
            >
              <h4 
                className={`
                  text-base font-bold mb-2 transition-colors duration-300
                  ${isActive ? 'text-blue-800' : 'text-slate-900'}
                `}
              >
                {step.title}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                {step.description}
              </p>
            </div>

          </div>
        );
      })}
    </div>
  );
}