import React, { useState } from 'react';
import { X } from 'lucide-react';

interface StartGameDialogProps {
  onClose: () => void;
  onSubmit: (width: number, length: number) => void;
}

const StartGameDialog: React.FC<StartGameDialogProps> = ({ onClose, onSubmit }) => {
  const [width, setWidth] = useState<string>('4');
  const [length, setLength] = useState<string>('5');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const widthNum = parseFloat(width);
    const lengthNum = parseFloat(length);
    
    if (isNaN(widthNum) || isNaN(lengthNum)) {
      setError('יש להזין מספרים בלבד');
      return;
    }
    
    if (widthNum < 1 || widthNum > 20 || lengthNum < 1 || lengthNum > 20) {
      setError('המידות חייבות להיות בין 1 ל-20 מטר');
      return;
    }
    
    onSubmit(widthNum, lengthNum);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">הגדרת מידות המטבח</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="width" className="block text-sm font-medium text-gray-700">
              רוחב (במטרים):
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
              min="1"
              max="20"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-colors"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="length" className="block text-sm font-medium text-gray-700">
              אורך (במטרים):
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
              min="1"
              max="20"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-colors"
              required
            />
          </div>
          
          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}
          
          <div className="flex gap-3 justify-end pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              ביטול
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              אישור
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartGameDialog;