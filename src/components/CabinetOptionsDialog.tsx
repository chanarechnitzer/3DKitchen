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

  // ✅ FIXED: חישוב נכון של השטח הזמין
  const calculateFillWidth = () => {
    if (!position || !kitchenDimensions) {
      console.log('❌ Missing position or kitchen dimensions');
      return defaultWidth;
    }
    
    console.log('🎯 Calculating fill width for position:', position);
    console.log('🏠 Kitchen dimensions:', kitchenDimensions);
    
    // ✅ SIMPLE: חישוב גבולות המטבח
    const halfWidth = kitchenDimensions.width / 2;
    const margin = 0.05; // מרחק מהקירות
    
    // ✅ SIMPLE: התחל מהקירות
    let leftBound = -halfWidth + margin;
    let rightBound = halfWidth - margin;
    
    console.log('🏠 Kitchen bounds:', { leftBound, rightBound, totalWidth: rightBound - leftBound });
    
    // ✅ SIMPLE: מצא את הפריט הקרוב ביותר משמאל ומימין
    let closestLeft = leftBound;
    let closestRight = rightBound;
    
    console.log('🔍 Checking', placedItems.length, 'placed items');
    
    placedItems.forEach(item => {
      if (!item.position || !item.dimensions) return;
      
      console.log('📦 Checking item:', item.name, 'at position:', item.position);
      
      // ✅ SIMPLE: רק פריטים באותו שורה (Z דומה)
      const zDiff = Math.abs(item.position.z - position.z);
      if (zDiff > 0.5) {
        console.log('⏭️ Skipping', item.name, '- different row (zDiff:', zDiff, ')');
        return; // לא באותו שורה
      }
      
      // ✅ SIMPLE: דלג על הפריט הנוכחי
      const isSame = Math.abs(item.position.x - position.x) < 0.1;
      if (isSame) {
        console.log('⏭️ Skipping', item.name, '- same position');
        return;
      }
      
      const itemLeft = item.position.x - item.dimensions.width / 2;
      const itemRight = item.position.x + item.dimensions.width / 2;
      
      console.log('📏 Item bounds:', { itemLeft, itemRight, itemCenter: item.position.x });
      
      // ✅ SIMPLE: אם הפריט משמאל למיקום הנוכחי
      if (itemRight < position.x) {
        const newLeft = itemRight + 0.02; // 2 ס"מ מרווח
        if (newLeft > closestLeft) {
          closestLeft = newLeft;
          console.log('⬅️ Updated closest left to:', closestLeft, 'from item:', item.name);
        }
      }
      
      // ✅ SIMPLE: אם הפריט מימין למיקום הנוכחי
      if (itemLeft > position.x) {
        const newRight = itemLeft - 0.02; // 2 ס"מ מרווח
        if (newRight < closestRight) {
          closestRight = newRight;
          console.log('➡️ Updated closest right to:', closestRight, 'from item:', item.name);
        }
      }
    });
    
    // ✅ SIMPLE: חישוב הרוחב הזמין
    const availableWidth = closestRight - closestLeft;
    
    console.log('📐 Fill calculation:', {
      position: position.x,
      closestLeft,
      closestRight,
      availableWidth,
      availableWidthCm: Math.round(availableWidth * 100)
    });
    
    // ✅ SIMPLE: הגבל בין 30 ס"מ ל-300 ס"מ
    const finalWidth = Math.max(0.3, Math.min(3.0, availableWidth));
    
    console.log('✅ Final width:', Math.round(finalWidth * 100), 'cm');
    
    return finalWidth;
  };

  const fillWidth = calculateFillWidth();

  const handleConfirm = () => {
    console.log('🎯 User confirmed option:', selectedOption);
    if (selectedOption === 'custom') {
      console.log('📏 Custom width:', customWidth);
      onConfirm(selectedOption, customWidth);
    } else if (selectedOption === 'fill') {
      console.log('🔧 Fill width:', fillWidth);
      onConfirm(selectedOption, fillWidth);
    } else {
      console.log('✋ Keep current width:', defaultWidth);
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