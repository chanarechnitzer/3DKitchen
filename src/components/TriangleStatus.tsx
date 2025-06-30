import React from 'react';
import { Check, X, AlertCircle, Target, Zap } from 'lucide-react';
import { TriangleValidation } from '../store/KitchenContext';

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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <Check className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-800">מושלם! 🎉</h3>
              <p className="text-green-700 text-sm">המטבח שלך עומד בכל דרישות המשולש הזהב</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Check size={14} className="text-green-600" />
              <span>מרחקים אופטימליים</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Check size={14} className="text-green-600" />
              <span>זרימת עבודה יעילה</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Check size={14} className="text-green-600" />
              <span>עיצוב מקצועי</span>
            </div>
          </div>
        </div>
      );
    }

    if (triangleComplete && !isValid && violations && violations.length > 0) {
      return (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
              <X className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">נדרש תיקון</h3>
              <p className="text-red-700 text-sm">המשולש הזהב זקוק להתאמות</p>
            </div>
          </div>
          <ul className="space-y-1">
            {violations.map((violation, index) => (
              <li key={index} className="flex items-center gap-2 text-xs text-red-700">
                <AlertCircle size={12} className="text-red-600" />
                {violation}
              </li>
            ))}
          </ul>
          <div className="mt-3 p-2 bg-red-100 rounded-lg">
            <p className="text-xs text-red-800 font-medium">
              💡 טיפ: גרור את הרכיבים למיקומים חדשים כדי לתקן את המרחקים
            </p>
          </div>
        </div>
      );
    }

    if (triangleComplete && !isValid) {
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <AlertCircle className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-800">כמעט מושלם!</h3>
              <p className="text-yellow-700 text-sm">בדוק את המרחקים בין הרכיבים</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${
      isComplete ? 'ring-2 ring-primary ring-opacity-50' : ''
    }`}>
      <div className="bg-gradient-to-r from-primary/10 to-yellow-500/10 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-500 rounded-xl flex items-center justify-center">
            {isComplete ? <Zap className="text-white" size={16} /> : <Target className="text-white" size={16} />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">המשולש הזהב</h2>
            <p className="text-xs text-gray-600">מדידת יעילות המטבח</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {getValidationMessage()}
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="text-lg">💧🔥</div>
              <span className="font-medium text-gray-900 text-sm">כיור ← כיריים</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${
                isValidSide(sides.sinkToStove) ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatDistance(sides.sinkToStove)}מ'
              </span>
              {isValidSide(sides.sinkToStove) ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center gap-2">
              <div className="text-lg">💧❄️</div>
              <span className="font-medium text-gray-900 text-sm">כיור ← מקרר</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${
                isValidSide(sides.sinkToRefrigerator) ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatDistance(sides.sinkToRefrigerator)}מ'
              </span>
              {isValidSide(sides.sinkToRefrigerator) ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2">
              <div className="text-lg">🔥❄️</div>
              <span className="font-medium text-gray-900 text-sm">כיריים ← מקרר</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${
                isValidSide(sides.stoveToRefrigerator) ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatDistance(sides.stoveToRefrigerator)}מ'
              </span>
              {isValidSide(sides.stoveToRefrigerator) ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-gray-600" size={14} />
            <span className="font-medium text-gray-900 text-sm">כללי המשולש הזהב</span>
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <p>• כל מרחק חייב להיות <strong>ארוך מ-1.2 מטר</strong> (למניעת צפיפות)</p>
            <p>• כל מרחק חייב להיות <strong>קצר מ-5 מטר</strong> (ליעילות בעבודה)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriangleStatus;