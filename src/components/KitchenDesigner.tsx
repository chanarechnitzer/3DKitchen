import React, { useEffect } from 'react';
import KitchenScene from './KitchenScene';
import KitchenControls from './KitchenControls';
import TriangleStatus from './TriangleStatus';
import Confetti from './Confetti';
import ErrorBoundary from './ErrorBoundary';
import { useKitchen } from '../store/KitchenContext';

const KitchenDesigner: React.FC = () => {
  const { 
    gameCompleted, 
    triangleValidation,
    kitchenDimensions
  } = useKitchen();
  
  useEffect(() => {
    document.title = gameCompleted 
      ? 'יפה מאוד! סיימת את אתגר המשולש הזהב!' 
      : 'משחק המשולש הזהב למטבח';
  }, [gameCompleted]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-[500px] md:h-[600px] relative">
          <ErrorBoundary>
            <KitchenScene />
          </ErrorBoundary>
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-bold mb-4 text-primary-dark">מידות המטבח</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-3 text-center">
              <p className="text-sm text-gray-600">רוחב</p>
              <p className="text-xl font-medium">{kitchenDimensions.width} מ'</p>
            </div>
            <div className="border rounded p-3 text-center">
              <p className="text-sm text-gray-600">אורך</p>
              <p className="text-xl font-medium">{kitchenDimensions.length} מ'</p>
            </div>
          </div>
        </div>
        
        {triangleValidation && (
          <TriangleStatus 
            validation={triangleValidation} 
            isComplete={gameCompleted}
          />
        )}
        
        <KitchenControls />
      </div>
      
      {gameCompleted && <Confetti />}
    </div>
  );
};

export default KitchenDesigner;