import React, { useState } from 'react';
import Rules from './components/Rules';
import KitchenDesigner from './components/KitchenDesigner';
import StartGameDialog from './components/StartGameDialog';
import { KitchenProvider } from './store/KitchenContext';

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
          {!gameStarted && !showRules && (
            <div className="flex justify-center mb-8 mt-16">
              <button 
                className="px-6 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-105 active:scale-95" 
                onClick={handleStartGame}
              >
                התחל משחק
              </button>
            </div>
          )}

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