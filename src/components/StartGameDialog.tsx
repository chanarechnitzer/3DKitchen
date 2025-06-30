import React, { useState } from 'react';
import { X, Home, ArrowLeft } from 'lucide-react';
import { useKitchen, WindowPlacement } from '../store/KitchenContext';

interface StartGameDialogProps {
  onClose: () => void;
  onSubmit: (width: number, length: number) => void;
}

const StartGameDialog: React.FC<StartGameDialogProps> = ({ onClose, onSubmit }) => {
  const [width, setWidth] = useState<string>('4');
  const [length, setLength] = useState<string>('5');
  const [error, setError] = useState<string>('');
  const { setKitchenDimensions, setWindowPlacement } = useKitchen();
  const [selectedWindow, setSelectedWindow] = useState<WindowPlacement>(WindowPlacement.OPPOSITE);

  const validateDimensions = (value: number): boolean => {
    return !isNaN(value) && value >= 2 && value <= 15;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const widthNum = parseFloat(width);
    const lengthNum = parseFloat(length);
    
    if (!validateDimensions(widthNum) || !validateDimensions(lengthNum)) {
      setError('המידות חייבות להיות בין 2 ל-15 מטר לחדר פונקציונלי');
      return;
    }
    
    setKitchenDimensions({ width: widthNum, length: lengthNum });
    setWindowPlacement(selectedWindow);
    onSubmit(widthNum, lengthNum);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-500 rounded-xl flex items-center justify-center">
              <Home className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">הגדרת המטבח</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="סגור"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          הגדר את מידות המטבח שלך ומיקום החלון כדי להתחיל בתכנון
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="width" className="block text-sm font-semibold text-gray-700">
                רוחב (מטר)
              </label>
              <input
                id="width"
                type="number"
                value={width}
                onChange={(e) => {
                  setWidth(e.target.value);
                  setError('');
                }}
                step="0.1"
                min="2"
                max="15"
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center font-medium focus:border-primary focus:ring-0 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="length" className="block text-sm font-semibold text-gray-700">
                אורך (מטר)
              </label>
              <input
                id="length"
                type="number"
                value={length}
                onChange={(e) => {
                  setLength(e.target.value);
                  setError('');
                }}
                step="0.1"
                min="2"
                max="15"
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center font-medium focus:border-primary focus:ring-0 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              מיקום החלון
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: WindowPlacement.OPPOSITE, label: 'מול הכניסה', desc: 'החלון ממוקם בקיר הנגדי לכניסה' },
                { value: WindowPlacement.RIGHT, label: 'מימין לכניסה', desc: 'החלון ממוקם בקיר הימני' },
                { value: WindowPlacement.LEFT, label: 'משמאל לכניסה', desc: 'החלון ממוקם בקיר השמאלי' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedWindow === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="window"
                    value={option.value}
                    checked={selectedWindow === option.value}
                    onChange={(e) => setSelectedWindow(e.target.value as WindowPlacement)}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              ביטול
            </button>
            <button 
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-yellow-500 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <span>התחל עיצוב</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartGameDialog;