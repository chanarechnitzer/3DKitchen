import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import KitchenDesigner from './components/KitchenDesigner';
import StartGameDialog from './components/StartGameDialog';
import CustomizationPanel from './components/CustomizationPanel';
import { KitchenProvider, useKitchen } from './store/KitchenContext';
import { RotateCcw, Home } from 'lucide-react';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'setup' | 'customize' | 'design'>('welcome');
  const [showStartDialog, setShowStartDialog] = useState(false);
  
  const handleStartDesign = () => {
    setShowStartDialog(true);
  };

  const handleCloseDialog = () => {
    setShowStartDialog(false);
  };

  const handleGameStart = (width: number, length: number) => {
    setCurrentScreen('customize');
    setShowStartDialog(false);
  };

  const handleNewGame = () => {
    window.location.reload();
  };

  const handleStartDesigning = () => {
    setCurrentScreen('design');
  };

  const handleBackToCustomize = () => {
    setCurrentScreen('customize');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStartDesign={handleStartDesign} />;
      case 'customize':
        return <CustomizationPanel onStartDesigning={handleStartDesigning} />;
      case 'design':
        return <KitchenDesigner onBackToCustomize={handleBackToCustomize} />;
      default:
        return <WelcomeScreen onStartDesign={handleStartDesign} />;
    }
  };

  return (
    <KitchenProvider>
      <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {currentScreen === 'design' && (
          <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 h-16 flex-shrink-0">
            <div className="container mx-auto px-6 h-full">
              <div className="flex justify-between items-center h-full">
                <div className="flex items-center gap-3">
                  <Home className="text-primary" size={20} />
                  <h1 className="text-lg font-bold text-gray-800">מעצב המטבח המקצועי</h1>
                </div>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  onClick={handleNewGame}
                >
                  <RotateCcw size={14} />
                  התחל מחדש
                </button>
              </div>
            </div>
          </header>
        )}

        <div className={currentScreen === 'design' ? 'h-[calc(100vh-4rem)]' : 'h-full'}>
          {renderCurrentScreen()}
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