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
      console.log('❌ Missing position or kitchen dimensions', { position, kitchenDimensions });
      return defaultWidth;
    }
    
    console.log('🔍 Starting fill width calculation for position:', position);
    console.log('🏠 Kitchen dimensions:', kitchenDimensions);
    console.log('📦 Available placed items:', placedItems.length);
    
    // חישוב גבולות המטבח
    const halfWidth = kitchenDimensions.width / 2;
    const wallMargin = 0.05; // מרחק מהקיר
    const itemMargin = 0.02; // מרחק בין פריטים
    
    // גבולות ברירת מחדל - מהקיר השמאלי לקיר הימני
    let leftBoundary = -halfWidth + wallMargin;
    let rightBoundary = halfWidth - wallMargin;
    
    console.log('🏗️ Initial boundaries (wall to wall):');
    console.log(`   Left boundary: ${leftBoundary.toFixed(3)}m`);
    console.log(`   Right boundary: ${rightBoundary.toFixed(3)}m`);
    console.log(`   Initial available width: ${(rightBoundary - leftBoundary).toFixed(3)}m (${((rightBoundary - leftBoundary) * 100).toFixed(0)}cm)`);
    
    // ✅ FIXED: מצא רכיבים באותו שורה (Z דומה) שיכולים להגביל את הרוחב
    const relevantItems = [];
    
    for (const item of placedItems) {
      if (!item.position || !item.dimensions) {
        console.log(`⚠️ Item ${item.name} missing position or dimensions`);
        continue;
      }
      
      // דלג על הפריט הנוכחי אם הוא כבר קיים במיקום זה
      const isSamePosition = Math.abs(item.position.x - position.x) < 0.1 && 
                            Math.abs(item.position.z - position.z) < 0.1;
      if (isSamePosition) {
        console.log(`🔄 Skipping same position item: ${item.name} at (${item.position.x.toFixed(2)}, ${item.position.z.toFixed(2)})`);
        continue;
      }
      
      // ✅ FIXED: בדוק אם הפריט באותו שורה (מרחק Z קטן מ-1.0 מטר)
      const zDistance = Math.abs(item.position.z - position.z);
      const isInSameRow = zDistance < 1.0; // הגדלתי את הטווח
      
      console.log(`📦 Item ${item.name}:`);
      console.log(`   Position: X=${item.position.x.toFixed(3)}, Z=${item.position.z.toFixed(3)}`);
      console.log(`   Dimensions: W=${item.dimensions.width.toFixed(3)}, D=${item.dimensions.depth.toFixed(3)}`);
      console.log(`   Z distance: ${zDistance.toFixed(3)}m`);
      console.log(`   In same row: ${isInSameRow}`);
      
      if (isInSameRow) {
        relevantItems.push(item);
      }
    }
    
    console.log(`🎯 Found ${relevantItems.length} relevant items in same row`);
    
    // ✅ FIXED: עדכן גבולות בהתאם לרכיבים הקיימים
    for (let i = 0; i < relevantItems.length; i++) {
      const item = relevantItems[i];
      const itemLeft = item.position.x - item.dimensions.width / 2;
      const itemRight = item.position.x + item.dimensions.width / 2;
      
      console.log(`📦 Processing item ${i + 1}: ${item.name}`);
      console.log(`   Item boundaries: left=${itemLeft.toFixed(3)}, right=${itemRight.toFixed(3)}`);
      console.log(`   Target position X: ${position.x.toFixed(3)}`);
      
      // ✅ FIXED: אם הפריט משמאל למיקום הנוכחי (עם מרווח)
      if (itemRight <= position.x - 0.1) { // הפריט משמאל עם מרווח
        const newLeftBoundary = itemRight + itemMargin;
        if (newLeftBoundary > leftBoundary) {
          console.log(`⬅️ Updated left boundary from ${leftBoundary.toFixed(3)} to ${newLeftBoundary.toFixed(3)}`);
          leftBoundary = newLeftBoundary;
        }
      }
      
      // ✅ FIXED: אם הפריט מימין למיקום הנוכחי (עם מרווח)
      if (itemLeft >= position.x + 0.1) { // הפריט מימין עם מרווח
        const newRightBoundary = itemLeft - itemMargin;
        if (newRightBoundary < rightBoundary) {
          console.log(`➡️ Updated right boundary from ${rightBoundary.toFixed(3)} to ${newRightBoundary.toFixed(3)}`);
          rightBoundary = newRightBoundary;
        }
      }
    }
    
    // ✅ FIXED: חישוב הרוחב הזמין
    const availableWidth = rightBoundary - leftBoundary;
    console.log('📐 Final calculation:');
    console.log(`   Final left boundary: ${leftBoundary.toFixed(3)}m`);
    console.log(`   Final right boundary: ${rightBoundary.toFixed(3)}m`);
    console.log(`   Available width: ${availableWidth.toFixed(3)}m (${(availableWidth * 100).toFixed(0)}cm)`);
    
    // ✅ FIXED: הגבל בין 20 ס"מ ל-400 ס"מ (יותר גמיש)
    const finalWidth = Math.max(0.2, Math.min(4.0, availableWidth));
    
    if (finalWidth !== availableWidth) {
      console.log(`⚠️ Width was limited from ${(availableWidth * 100).toFixed(0)}cm to ${(finalWidth * 100).toFixed(0)}cm`);
    }
    
    console.log(`✅ Final cabinet width: ${finalWidth.toFixed(3)}m (${(finalWidth * 100).toFixed(0)}cm)`);
    
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