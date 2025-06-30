import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import KitchenDesigner from './components/KitchenDesigner';
import StartGameDialog from './components/StartGameDialog';
import CustomizationPanel from './components/CustomizationPanel';
import { KitchenProvider, useKitchen } from './store/KitchenContext';
import { RotateCcw, Home } from 'lucide-react';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'setup' | 'design' | 'customize'>('welcome');
  const [showStartDialog, setShowStartDialog] = useState(false);
  
  const handleStartDesign = () => {
    setShowStartDialog(true);
  };

  const handleCloseDialog = () => {
    setShowStartDialog(false);
  };

  const handleGameStart = (width: number, length: number) => {
    setCurrentScreen('design');
    setShowStartDialog(false);
  };

  const handleNewGame = () => {
    window.location.reload();
  };

  const handleCustomize = () => {
    setCurrentScreen('customize');
  };

  const handleBackToDesign = () => {
    setCurrentScreen('design');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStartDesign={handleStartDesign} />;
      case 'design':
        return <KitchenDesigner onCustomize={handleCustomize} />;
      case 'customize':
        return <CustomizationPanel onBackToDesign={handleBackToDesign} />;
      default:
        return <WelcomeScreen onStartDesign={handleStartDesign} />;
    }
  };

  return (
    <KitchenProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {currentScreen === 'design' && (
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Home className="text-primary" size={24} />
                  <h1 className="text-xl font-bold text-gray-800">מעצב המטבח המקצועי</h1>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  onClick={handleNewGame}
                >
                  <RotateCcw size={16} />
                  התחל מחדש
                </button>
              </div>
            </div>
          </header>
        )}

        {renderCurrentScreen()}

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