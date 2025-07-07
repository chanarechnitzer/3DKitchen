import React, { useEffect, useState } from 'react';
import KitchenScene from './KitchenScene';
import KitchenControls from './KitchenControls';
import TriangleStatus from './TriangleStatus';
import Confetti from './Confetti';
import ErrorBoundary from './ErrorBoundary';
import { useKitchen } from '../store/KitchenContext';
import { Palette, CheckCircle, Lightbulb, ArrowRight, Edit3, RotateCcw } from 'lucide-react';

interface KitchenDesignerProps {
  onBackToCustomize: () => void;
}

const KitchenDesigner: React.FC<KitchenDesignerProps> = ({ onBackToCustomize }) => {
  const { 
    gameCompleted, 
    setGameCompleted,
    triangleValidation,
    kitchenDimensions,
    windowPlacement,
    selectedItem,
    placedItems
  } = useKitchen();
  
  const [designPhaseComplete, setDesignPhaseComplete] = useState(false);

  useEffect(() => {
    document.title = gameCompleted 
      ? '🎉 מעולה! המטבח שלך מושלם!' 
      : 'מעצב המטבח המקצועי';
  }, [gameCompleted]);

  // Check if all three essential triangle items are placed
  const hasTriangleItems = () => {
    const hasSink = placedItems.some(item => item.type === 'sink');
    const hasStove = placedItems.some(item => item.type === 'stove');
    const hasRefrigerator = placedItems.some(item => item.type === 'refrigerator');
    
    return hasSink && hasStove && hasRefrigerator;
  };

  const handleFinishDesigning = () => {
    console.log('User clicked finish designing button');
    console.log('Triangle validation:', triangleValidation);
    
    // ✅ CRITICAL: IMMEDIATELY clear selection state - no delays
    setSelectedItem(null);
    
    // Always mark design phase as complete when user clicks the button
    setDesignPhaseComplete(true);
    
    // CRITICAL: Only mark game as completed if triangle is actually valid
    if (triangleValidation?.isValid === true) {
      console.log('Triangle is valid - completing game');
      setGameCompleted(true);
      // ✅ REMOVED: No completion dialog anymore - just confetti
    } else {
      console.log('Triangle is not valid - design phase complete but game not completed');
      // Design phase is complete but game is NOT completed
      setGameCompleted(false);
    }
  };

  // ✅ NEW: Handle going back to editing mode - allows user to move items after finishing
  const handleBackToEditing = () => {
    // ✅ CRITICAL: IMMEDIATELY clear selection state
    setSelectedItem(null);
    
    setDesignPhaseComplete(false);
    setGameCompleted(false);
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full grid grid-cols-1 xl:grid-cols-4 gap-3 p-3">
        {/* Main Design Area */}
        <div className="xl:col-span-3 flex flex-col">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-yellow-500 rounded-lg flex items-center justify-center">
                    <Lightbulb className="text-white" size={14} />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">אזור העיצוב</h2>
                </div>
                <div className="text-xs text-gray-600">
                  {kitchenDimensions.width} × {kitchenDimensions.length} מטר
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-blue-50">
              <ErrorBoundary>
                {/* CRITICAL: Pass showTriangle prop - only show triangle after design phase is complete */}
                <KitchenScene 
                  windowPlacement={windowPlacement} 
                  showTriangle={designPhaseComplete}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="xl:col-span-1 flex flex-col gap-3 max-h-full overflow-hidden">
          {/* Kitchen Info */}
          <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 flex-shrink-0">
            <h3 className="text-base font-bold text-gray-900 mb-2">פרטי המטבח</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600 mb-1">רוחב</p>
                <p className="text-sm font-bold text-gray-900">{kitchenDimensions.width}מ'</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600 mb-1">אורך</p>
                <p className="text-sm font-bold text-gray-900">{kitchenDimensions.length}מ'</p>
              </div>
            </div>
          </div>
          
          {/* Triangle Status - Pass designPhaseComplete prop */}
          {triangleValidation && (
            <div className="flex-shrink-0">
              <TriangleStatus 
                validation={triangleValidation} 
                isComplete={gameCompleted}
                designPhaseComplete={designPhaseComplete}
              />
            </div>
          )}
          
          {/* Kitchen Controls - Only show if no item is being dragged */}
          {!designPhaseComplete && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <KitchenControls />
            </div>
          )}
          
          {/* Action Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 space-y-2 bg-white rounded-xl p-3 border border-gray-100 shadow-lg">
            {/* Message when triangle items are missing */}
            {!hasTriangleItems() && !designPhaseComplete && (
              <div className="w-full p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 text-center">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  🎯 הנח את 3 רכיבי המשולש
                </p>
                <p className="text-xs text-blue-600">
                  כיור 💧 + כיריים 🔥 + מקרר ❄️
                </p>
              </div>
            )}

            {/* Finish Designing Button - Show when triangle items are placed and design not finished */}
            {hasTriangleItems() && !designPhaseComplete && !selectedItem && (
              <button
                onClick={handleFinishDesigning}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-green-400"
              >
                <CheckCircle size={18} />
                <span>🎯 סיימתי לעצב!</span>
              </button>
            )}

            {/* ✅ NEW: Show message and options after design phase is complete but triangle is invalid */}
            {designPhaseComplete && !gameCompleted && triangleValidation && !triangleValidation.isValid && !selectedItem && (
              <div className="w-full space-y-2">
                <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 text-center">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    ⚠️ המשולש זקוק לתיקון
                  </p>
                  <p className="text-xs text-red-600 mb-2">
                    תקן את המרחקים ולחץ שוב על "סיימתי לעצב"
                  </p>
                </div>
                
                {/* ✅ NEW: Back to editing button - allows moving items */}
                <button
                  onClick={handleBackToEditing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit3 size={16} />
                  חזור לעריכה (הסר והזז רכיבים)
                </button>
                
                {/* Try again button */}
                <button
                  onClick={handleFinishDesigning}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <CheckCircle size={18} />
                  <span>🎯 סיימתי לעצב!</span>
                </button>
              </div>
            )}

            {/* ✅ NEW: Show options when design is complete but triangle is incomplete (missing items) */}
            {designPhaseComplete && !gameCompleted && triangleValidation && !triangleValidation.isComplete && !selectedItem && (
              <div className="w-full space-y-2">
                <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 text-center">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    🎯 המשולש לא הושלם
                  </p>
                  <p className="text-xs text-yellow-600 mb-2">
                    הוסף את הרכיבים החסרים: כיור 💧 + כיריים 🔥 + מקרר ❄️
                  </p>
                </div>
                
                {/* Back to editing button */}
                <button
                  onClick={handleBackToEditing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit3 size={16} />
                  הוסף רכיבים חסרים
                </button>
                
                {/* Try again button */}
                <button
                  onClick={handleFinishDesigning}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <CheckCircle size={18} />
                  <span>🎯 סיימתי לעצב!</span>
                </button>
              </div>
            )}
            {/* ✅ NEW: Show options when design is complete and triangle is valid */}
            {designPhaseComplete && gameCompleted && triangleValidation?.isValid && !selectedItem && (
              <div className="w-full space-y-2">
                {/* Success message */}
                <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 text-center">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    🎉 מושלם! המשולש הזהב תקין
                  </p>
                  <p className="text-xs text-green-600">
                    עכשיו תוכל להתאים אישית את הצבעים
                  </p>
                </div>

                {/* Back to editing option */}
                <button
                  onClick={handleBackToEditing}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw size={14} />
                  עדכן עיצוב
                </button>

                {/* Back to Customization Button */}
                <button
                  onClick={onBackToCustomize}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Palette size={16} />
                  <span>התאם אישית</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
            
            {/* ✅ REMOVED: Moved to dedicated panel above */}
          </div>
        </div>
      </div>
      
      {/* ✅ FIXED: Only confetti, no completion dialog */}
      {gameCompleted && designPhaseComplete && triangleValidation?.isValid && <Confetti />}
    </div>
  );
};

export default KitchenDesigner;