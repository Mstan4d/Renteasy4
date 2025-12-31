// src/modules/properties/components/ProgressIndicator.jsx
import React from 'react';
import { Check } from 'lucide-react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ currentStep, steps }) => {
  return (
    <div className="progress-indicator">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            transition: 'width 0.3s ease-in-out'
          }}
        ></div>
      </div>
      
      {/* Step Indicators */}
      <div className="step-indicators">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          
          return (
            <div 
              key={index} 
              className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              {/* Step Circle */}
              <div className="step-circle">
                {isCompleted ? (
                  <Check size={16} />
                ) : (
                  <span className="step-number">{stepNumber}</span>
                )}
              </div>
              
              {/* Step Label */}
              <span className="step-label">{step}</span>
              
              {/* Connector Line (except for last step) */}
              {index < steps.length - 1 && (
                <div className="step-connector">
                  <div className={`connector-line ${isCompleted ? 'completed' : ''}`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;