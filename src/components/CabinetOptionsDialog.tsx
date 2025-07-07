import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface CabinetOptionsDialogProps {
  onClose: () => void;
  onConfirm: (width: number) => void;
  defaultWidth: number;
}

const CabinetOptionsDialog: React.FC<CabinetOptionsDialogProps> = ({ 
  onClose, 
  onConfirm, 
  defaultWidth 
}) => {
  const [selectedWidth, setSelectedWidth] = useState(defaultWidth);

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
    onConfirm(selectedWidth);
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
              <Ruler className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">בחר רוחב ארון</h2>
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
          בחר את הרוחב המתאים לארון המטבח שלך
        </p>
        
        <div className="space-y-3 mb-6">
          {widthOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedWidth === option.value
                  ? 'border-primary bg-primary/5 shadow-lg'
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
                <div className="font-semibold text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </div>
              {selectedWidth === option.value && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </label>
          ))}
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