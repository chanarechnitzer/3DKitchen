import React, { useEffect, useState } from 'react';
import KitchenScene from './KitchenScene';
import KitchenControls from './KitchenControls';
import TriangleStatus from './TriangleStatus';
import Confetti from './Confetti';
import { useKitchen } from '../store/KitchenContext';

const KitchenDesigner: React.FC = () => {
  const { 
    gameCompleted, 
    triangleValidation,
    kitchenDimensions
  } = useKitchen();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showInitialMessage, setShowInitialMessage] = useState(true);

  useEffect(() => {
    document.title = gameCompleted 
      ? 'יפה מאוד! סיימת את אתגר המשולש הזהב!' 
      : 'משחק המשולש הזהב למטבח';
  }, [gameCompleted]);

  useEffect(() => {
    // בדיקת תקינות המידות
    const width = Number(kitchenDimensions.width);
    const length = Number(kitchenDimensions.length);
    
    const isValidDimensions = 
      !isNaN(width) && 
      !isNaN(length) && 
      width > 0 && 
      length > 0;

    // אם יש מידות תקינות, נסתיר את ההודעה ונציג את החדר
    if (isValidDimensions) {
      setShowInitialMessage(false);
      setIsLoading(false);
    }
  }, [kitchenDimensions]);

  if (showInitialMessage) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600">יש להזין את מידות המטבח כדי להתחיל</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-[500px] md:h-[600px] relative">
          <KitchenScene />
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