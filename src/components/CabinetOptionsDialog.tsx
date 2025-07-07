import React, { useState } from 'react';
import { X, Ruler, Check, Maximize2 } from 'lucide-react';

interface CabinetOptionsDialogProps {
  onClose: () => void;
  onConfirm: (option: 'keep' | 'custom' | 'fill', width?: number) => void;
  defaultWidth: number;
  availableSpace?: number; // Space available to fill
  hasAdjacentItems?: boolean; // Whether there are adjacent items to fill between
}

const CabinetOptionsDialog: React.FC<CabinetOptionsDialogProps> = ({ 
  onClose, 
  onConfirm, 
  defaultWidth,
  availableSpace = 0,
  hasAdjacentItems = false
}) => {
  const [selectedWidth, setSelectedWidth] = useState(defaultWidth);
  const [selectedOption, setSelectedOption] = useState<'keep' | 'custom' | 'fill'>('keep');

  const widthOptions = [
    { value: 0.3, label: '30 ס"מ', desc: 'צר - למקומות קטנים' },
    { value: 0.4, label: '40 ס"מ', desc: 'בינוני-צר' },
    { value: 0.5, label: '50 ס"מ', desc: 'בינוני' },
    { value: 0.6, label: '60 ס"מ', desc: 'סטנדרטי' },
    { value: 0.8, label: '80 ס"מ', desc: 'רחב' },
    { value: 1.0, label: '100 ס"מ', desc: 'רחב מאוד' },
    { value: 1.2, label: '120 ס"מ', desc: 'ארון גדול' },
  ];

  const handleConfirm = () => {
    if (selectedOption === 'fill') {
      onConfirm('fill', availableSpace);
    } else if (selectedOption === 'custom') {
      onConfirm('custom', selectedWidth);
    } else {
      onConfirm('keep', defaultWidth);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
              <Ruler className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">אפשרויות ארון מטבח</h2>
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
        
        {/* Main Options */}
        <div className="space-y-4 mb-6">
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
              value="keep"
              checked={selectedOption === 'keep'}
              onChange={(e) => setSelectedOption(e.target.value as 'keep')}
              className="text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <span>📏</span>
                שמור על המידה הנוכחית
              </div>
              <div className="text-sm text-gray-600">{(defaultWidth * 100).toFixed(0)} ס"מ רוחב</div>
            </div>
            {selectedOption === 'keep' && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
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
              value="custom"
              checked={selectedOption === 'custom'}
              onChange={(e) => setSelectedOption(e.target.value as 'custom')}
              className="mt-1 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🎯</span>
                בחר מידה אחרת
              </div>
              <div className="text-sm text-gray-600 mb-3">בחר מתוך המידות הסטנדרטיות</div>
              
              {selectedOption === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  {widthOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                        selectedWidth === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="width"
                        value={option.value}
                        checked={selectedWidth === option.value}
                        onChange={(e) => setSelectedWidth(parseFloat(e.target.value))}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedOption === 'custom' && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
          </label>

          {/* Option 3: Fill space - always show with smart detection */}
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
              value="fill"
              checked={selectedOption === 'fill'}
              onChange={(e) => setSelectedOption(e.target.value as 'fill')}
              className="text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <Maximize2 size={16} className="text-primary" />
                מלא את כל השטח הזמין
              </div>
              <div className="text-sm text-gray-600">
                {hasAdjacentItems && availableSpace > 0.5 ? (
                  <>מלא את השטח בין הרכיבים או הקיר ({(availableSpace * 100).toFixed(0)} ס"מ)</>
                ) : (
                  <>זיהוי אוטומטי של השטח הזמין במטבח</>
                )}
              </div>
              <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <span>💡</span>
                <span>ניצול מקסימלי של השטח - חסכוני וחכם</span>
              </div>
            </div>
            {selectedOption === 'fill' && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
          </label>
        </div>

        {/* Info box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 mb-4">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-sm">ℹ️</span>
            <span className="text-sm font-medium">טיפ מקצועי</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {selectedOption === 'fill' 
              ? 'מילוי השטח יוצר רצף עבודה חלק ומקסם את השטח הזמין במטבח'
              : selectedOption === 'custom'
              ? 'מידות סטנדרטיות מבטיחות התאמה מושלמת לציוד מטבח'
              : 'שמירה על המידה הנוכחית מתאימה כשהמיקום מושלם'
            }
          </p>
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