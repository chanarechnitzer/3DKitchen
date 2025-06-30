import React, { useEffect, useState } from 'react';
import KitchenScene from './KitchenScene';
import KitchenControls from './KitchenControls';
import TriangleStatus from './TriangleStatus';
import ItemPreview from './ItemPreview';
import Confetti from './Confetti';
import ErrorBoundary from './ErrorBoundary';
import { useKitchen } from '../store/KitchenContext';
import { Palette, CheckCircle, Lightbulb } from 'lucide-react';

interface KitchenDesignerProps {
  onCustomize: () => void;
}

const KitchenDesigner: React.FC<KitchenDesignerProps> = ({ onCustomize }) => {
  const { 
    gameCompleted, 
    triangleValidation,
    kitchenDimensions,
    windowPlacement,
    selectedItem,
    placedItems
  } = useKitchen();
  
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  useEffect(() => {
    if (gameCompleted && !showCompletionDialog) {
      setTimeout(() => setShowCompletionDialog(true), 1000);
    }
  }, [gameCompleted, showCompletionDialog]);

  useEffect(() => {
    document.title = gameCompleted 
      ? '🎉 מעולה! המטבח שלך מושלם!' 
      : 'מעצב המטבח המקצועי';
  }, [gameCompleted]);

  const hasEssentialItems = () => {
    const sink = placedItems.find(item => item.type === 'sink');
    const stove = placedItems.find(item => item.type === 'stove');
    const refrigerator = placedItems.find(item => item.type === 'refrigerator');
    return sink && stove && refrigerator;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Design Area */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-500 rounded-lg flex items-center justify-center">
                    <Lightbulb className="text-white" size={16} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">אזור העיצוב</h2>
                </div>
                <div className="text-sm text-gray-600">
                  {kitchenDimensions.width} × {kitchenDimensions.length} מטר
                </div>
              </div>
            </div>
            
            <div className="h-[600px] lg:h-[700px] relative bg-gradient-to-br from-slate-50 to-blue-50">
              <ErrorBoundary>
                <KitchenScene windowPlacement={windowPlacement} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="xl:col-span-1 space-y-6">
          {/* Kitchen Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">פרטי המטבח</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">רוחב</p>
                <p className="text-xl font-bold text-gray-900">{kitchenDimensions.width}מ'</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">אורך</p>
                <p className="text-xl font-bold text-gray-900">{kitchenDimensions.length}מ'</p>
              </div>
            </div>
          </div>
          
          {/* Triangle Status */}
          {triangleValidation && (
            <TriangleStatus 
              validation={triangleValidation} 
              isComplete={gameCompleted}
            />
          )}
          
          {/* Kitchen Controls */}
          <KitchenControls />
          
          {/* Completion Button */}
          {hasEssentialItems() && gameCompleted && (
            <button
              onClick={onCustomize}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Palette size={20} />
              <span>התאם אישית</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Item Preview Modal */}
      {selectedItem && (
        <ItemPreview 
          item={selectedItem}
          onClose={() => {}}
        />
      )}
      
      {/* Completion Dialog */}
      {showCompletionDialog && gameCompleted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">מעולה!</h2>
            <p className="text-gray-600 mb-6">
              המטבח שלך עומד בכל הדרישות של המשולש הזהב. עכשיו אתה יכול להתאים אישית את הצבעים והחומרים.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompletionDialog(false)}
                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                המשך עיצוב
              </button>
              <button
                onClick={() => {
                  setShowCompletionDialog(false);
                  onCustomize();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all"
              >
                <Palette size={16} />
                התאם אישית
              </button>
            </div>
          </div>
        </div>
      )}
      
      {gameCompleted && <Confetti />}
    </div>
  );
};

export default KitchenDesigner;