import React, { useEffect, useState } from 'react';
import KitchenScene from './KitchenScene';
import KitchenControls from './KitchenControls';
import TriangleStatus from './TriangleStatus';
import ItemPreview from './ItemPreview';
import Confetti from './Confetti';
import ErrorBoundary from './ErrorBoundary';
import { useKitchen } from '../store/KitchenContext';
import { Palette, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';

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
  
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
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
    setDesignPhaseComplete(true);
    
    // Mark game as completed when user clicks finish button
    if (triangleValidation?.isValid) {
      setGameCompleted(true);
      setTimeout(() => setShowCompletionDialog(true), 500);
    } else {
      // Even if triangle is not valid, allow finishing design phase
      setGameCompleted(false);
    }
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
                <KitchenScene windowPlacement={windowPlacement} />
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
          
          {/* Triangle Status */}
          {triangleValidation && (
            <div className="flex-shrink-0">
              <TriangleStatus 
                validation={triangleValidation} 
                isComplete={gameCompleted}
              />
            </div>
          )}
          
          {/* Kitchen Controls */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <KitchenControls />
          </div>
          
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
            {hasTriangleItems() && !designPhaseComplete && (
              <button
                onClick={handleFinishDesigning}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-green-400"
              >
                <CheckCircle size={18} />
                <span>🎯 סיימתי לעצב!</span>
              </button>
            )}

            {/* Back to Customization Button - Only show after design is finished */}
            {designPhaseComplete && (
              <button
                onClick={onBackToCustomize}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Palette size={16} />
                <span>התאם אישית</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Item Preview Modal */}
      {selectedItem && (
        <ItemPreview 
          item={selectedItem}
          onClose={() => {}}
        />
      )}
      
      {/* Completion Dialog - Only show when user finishes designing and triangle is valid */}
      {showCompletionDialog && designPhaseComplete && gameCompleted && triangleValidation?.isValid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">מעולה!</h2>
            <p className="text-gray-600 mb-4">
              המטבח שלך עומד בכל הדרישות של משולש הזהב. עכשיו אתה יכול להתאים אישית את הצבעים והחומרים.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompletionDialog(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                המשך עיצוב
              </button>
              <button
                onClick={() => {
                  setShowCompletionDialog(false);
                  onBackToCustomize();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all"
              >
                <Palette size={16} />
                התאם אישית
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confetti only shows when game is actually completed by user action */}
      {gameCompleted && designPhaseComplete && triangleValidation?.isValid && <Confetti />}
    </div>
  );
};

export default KitchenDesigner;