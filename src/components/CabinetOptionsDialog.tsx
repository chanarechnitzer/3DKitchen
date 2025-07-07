import React, { useState } from 'react';
import { X, Ruler, Check, Maximize2, Settings } from 'lucide-react';

interface CabinetOptionsDialogProps {
  onClose: () => void;
  onConfirm: (option: 'keep' | 'custom' | 'fill', customWidth?: number) => void;
  defaultWidth: number;
  placedItems?: any[];
  position?: { x: number; z: number };
  kitchenDimensions?: { width: number; length: number };
}

const CabinetOptionsDialog: React.FC<CabinetOptionsDialogProps> = ({ 
  onClose, 
  onConfirm, 
  defaultWidth,
  placedItems = [],
  position,
  kitchenDimensions
}) => {
  const [selectedOption, setSelectedOption] = useState<'keep' | 'custom' | 'fill'>('keep');
  const [customWidth, setCustomWidth] = useState(defaultWidth);

  const widthOptions = [
    { value: 0.3, label: '30 ס"מ', desc: 'צר - למקומות קטנים' },
    { value: 0.4, label: '40 ס"מ', desc: 'בינוני-צר' },
    { value: 0.5, label: '50 ס"מ', desc: 'בינוני' },
    { value: 0.6, label: '60 ס"מ', desc: 'סטנדרטי' },
    { value: 0.8, label: '80 ס"מ', desc: 'רחב' },
    { value: 1.0, label: '100 ס"מ', desc: 'רחב מאוד' },
    { value: 1.2, label: '120 ס"מ', desc: 'ארון גדול' },
  ];

  // Calculate available space for fill option
  const calculateFillWidth = () => {
    if (!position || !kitchenDimensions) return defaultWidth;
    
    // Find nearest items on left and right
    let leftBoundary = -kitchenDimensions.width / 2 + 0.05; // Wall
    let rightBoundary = kitchenDimensions.width / 2 - 0.05; // Wall
    
    placedItems?.forEach(item => {
      const itemLeft = item.position.x - item.dimensions.width / 2;
      const itemRight = item.position.x + item.dimensions.width / 2;
      
      // Check if item is on the same Z line (approximately)
      if (Math.abs(item.position.z - position.z) < 0.3) {
        if (itemRight < position.x && itemRight > leftBoundary) {
          leftBoundary = itemRight + 0.01; // Small gap
        }
        if (itemLeft > position.x && itemLeft < rightBoundary) {
          rightBoundary = itemLeft - 0.01; // Small gap
        }
      }
    });
    
    const availableWidth = rightBoundary - leftBoundary;
    return Math.max(0.3, Math.min(2.0, availableWidth)); // Min 30cm, max 200cm
  };

  const fillWidth = calculateFillWidth();

  const handleConfirm = () => {
    if (selectedOption === 'custom') {
      onConfirm(selectedOption, customWidth);
    } else if (selectedOption === 'fill') {
      onConfirm(selectedOption, fillWidth);
    } else {
      onConfirm(selectedOption);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">אפשרויות ארון</h2>
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
          בחר את האפשרות המתאימה לארון המטבח שלך
        </p>
        
        <div className="space-y-3 mb-6">
          {/* Option 1: Keep current size */}
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === 'keep'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="option"
              checked={selectedOption === 'keep'}
              onChange={() => setSelectedOption('keep')}
              className="text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                שמור על המידה הנוכחית
              </div>
              <div className="text-sm text-gray-600">
                {(defaultWidth * 100).toFixed(0)} ס"מ רוחב
              </div>
            </div>
          </label>

          {/* Option 2: Custom size */}
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === 'custom'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="option"
              checked={selectedOption === 'custom'}
              onChange={() => setSelectedOption('custom')}
              className="mt-1 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <Ruler size={16} className="text-blue-600" />
                בחר מידה מותאמת אישית
              </div>
              
              {selectedOption === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  {widthOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex flex-col p-2 rounded-lg border cursor-pointer transition-all text-center ${
                        customWidth === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="customWidth"
                        value={option.value}
                        checked={customWidth === option.value}
                        onChange={(e) => setCustomWidth(parseFloat(e.target.value))}
                        className="sr-only"
                      />
                      <div className="font-medium text-xs">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </label>

          {/* Option 3: Fill available space */}
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === 'fill'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="option"
              checked={selectedOption === 'fill'}
              onChange={() => setSelectedOption('fill')}
              className="text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <Maximize2 size={16} className="text-purple-600" />
                מלא את כל השטח הזמין
              </div>
              <div className="text-sm text-gray-600">
                {(fillWidth * 100).toFixed(0)} ס"מ רוחב (בין רכיבים/קירות)
              </div>
              <div className="text-xs text-purple-600 mt-1">
                💡 ימלא אוטומטית את השטח בין הרכיבים הקיימים
              </div>
            </div>
          </label>
        </div>
        
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            ביטול
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-yellow-500 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Check size={16} />
            <span>אישור</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CabinetOptionsDialog;