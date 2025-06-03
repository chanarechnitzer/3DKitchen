import React from 'react';
import { Check, X } from 'lucide-react';
import { TriangleValidation } from '../store/KitchenContext';
import Confetti from './Confetti';

interface TriangleStatusProps {
  validation: TriangleValidation;
  isComplete: boolean;
}

const TriangleStatus: React.FC<TriangleStatusProps> = ({ validation, isComplete }) => {
  const { isValid, sides, violations, isComplete: triangleComplete } = validation;
  
  const formatDistance = (distance: number) => {
    return distance.toFixed(2);
  };
  
  const isValidSide = (distance: number) => {
    return distance > 1.2 && distance < 5;
  };

  const getValidationMessage = () => {
    if (isComplete) {
      return (
        <>
          <div className="bg-success/10 border border-success rounded p-3 mb-4">
            <p className="flex items-center gap-2 text-success font-medium">
              <Check size={18} className="text-success" />
              כל הכבוד! המשולש הזהב מושלם!
            </p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-success" />
                כל המרחקים גדולים מ-1.2 מטר
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-success" />
                כל המרחקים קטנים מ-5 מטר
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-success" />
                כל רכיבי המשולש הזהב במקומם
              </li>
            </ul>
          </div>
          <Confetti />
        </>
      );
    }

    if (triangleComplete && !isValid && violations && violations.length > 0) {
      return (
        <div className="bg-danger/10 border border-danger rounded p-3 mb-4">
          <p className="flex items-center gap-2 text-danger font-medium">
            <X size={18} className="text-danger" />
            המשולש הזהב לא תקין:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-danger">
            {violations.map((violation, index) => (
              <li key={index}>{violation}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            גרור את הרכיבים למיקום חדש כדי לתקן את המרחקים
          </p>
        </div>
      );
    }

    if (triangleComplete && !isValid) {
      return (
        <div className="bg-warning/10 border border-warning rounded p-3 mb-4">
          <p className="flex items-center gap-2 text-warning font-medium">
            <AlertCircle size={18} className="text-warning" />
            כמעט שם! בדוק את המרחקים בין הרכיבים
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-6 ${isComplete ? 'border-2 border-primary animate-pulse-gold' : ''}`}>
      <h2 className="text-xl font-bold mb-2 text-primary-dark">המשולש הזהב</h2>
      
      {getValidationMessage()}
      
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <p>כיור - כיריים:</p>
          <div className="flex items-center gap-2">
            <span className={isValidSide(sides.sinkToStove) ? 'text-success' : 'text-danger'}>
              {formatDistance(sides.sinkToStove)} מ'
            </span>
            {isValidSide(sides.sinkToStove) ? (
              <Check size={16} className="text-success" />
            ) : (
              <X size={16} className="text-danger" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
          <p>כיור - מקרר:</p>
          <div className="flex items-center gap-2">
            <span className={isValidSide(sides.sinkToRefrigerator) ? 'text-success' : 'text-danger'}>
              {formatDistance(sides.sinkToRefrigerator)} מ'
            </span>
            {isValidSide(sides.sinkToRefrigerator) ? (
              <Check size={16} className="text-success" />
            ) : (
              <X size={16} className="text-danger" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p>כיריים - מקרר:</p>
          <div className="flex items-center gap-2">
            <span className={isValidSide(sides.stoveToRefrigerator) ? 'text-success' : 'text-danger'}>
              {formatDistance(sides.stoveToRefrigerator)} מ'
            </span>
            {isValidSide(sides.stoveToRefrigerator) ? (
              <Check size={16} className="text-success" />
            ) : (
              <X size={16} className="text-danger" />
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-blue-50 p-3 rounded text-sm">
        <p>כל צלע של המשולש חייבת להיות ארוכה מ-1.2 מטר וקצרה מ-5 מטר</p>
      </div>
    </div>
  );
};

export default TriangleStatus;