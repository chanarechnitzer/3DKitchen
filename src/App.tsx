import React, { useState } from 'react';
import Rules from './components/Rules';
import KitchenDesigner from './components/KitchenDesigner';
import StartGameDialog from './components/StartGameDialog';
import { KitchenProvider, useKitchen } from './store/KitchenContext';
import { RotateCcw } from 'lucide-react';

function App() {
  const [showRules, setShowRules] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  
  const handleStartGame = () => {
    setShowStartDialog(true);
  };

  const handleCloseDialog = () => {
    setShowStartDialog(false);
  };

  const handleGameStart = (width: number, length: number) => {
    setGameStarted(true);
    setShowStartDialog(false);
    setShowRules(false);
  };

  const handleNewGame = () => {
    window.location.reload();
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  return (
    <KitchenProvider>
      <div className="min-h-screen bg-background">
        {showRules ? (
          <Rules onMinimize={toggleRules} />
        ) : (
          <div 
            className="bg-primary text-white py-2 px-4 text-center shadow-sm cursor-pointer hover:bg-primary-dark transition-colors" 
            onClick={toggleRules}
          >
            המשולש הזהב למטבח - לחץ להרחבה
          </div>
        )}

        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-8">
            {!gameStarted && !showRules && (
              <button 
                className="px-6 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-105 active:scale-95" 
                onClick={handleStartGame}
              >
                התחל משחק
              </button>
            )}
            
            {gameStarted && (
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-200 flex items-center gap-2"
                onClick={handleNewGame}
              >
                <RotateCcw size={16} />
                משחק חדש
              </button>
            )}
          </div>

          {gameStarted && <KitchenDesigner />}
        </div>

        {showStartDialog && (
          <StartGameDialog 
            onClose={handleCloseDialog} 
            onSubmit={handleGameStart}
          />
        )}
      </div>
    </KitchenProvider>
  );
}

export default App;