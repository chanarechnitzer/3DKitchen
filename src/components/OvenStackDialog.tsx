import React, { useState } from 'react';
import { X, Layers, Check } from 'lucide-react';

interface OvenStackDialogProps {
  onClose: () => void;
  onConfirm: (shouldStack: boolean) => void;
  baseOvenName: string;
}

const OvenStackDialog: React.FC<OvenStackDialogProps> = ({ 
  onClose, 
  onConfirm, 
  baseOvenName 
}) => {
  const [shouldStack, setShouldStack] = useState(false);

  const handleConfirm = () => {
    onConfirm(shouldStack);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Layers className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">תנור כפול</h2>
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
          זוהה תנור קיים במיקום זה ({baseOvenName}). האם ברצונך ליצור תנור כפול?
        </p>
        
        <div className="space-y-3 mb-6">
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              !shouldStack
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="stack"
              checked={!shouldStack}
              onChange={() => setShouldStack(false)}
              className="mt-1 text-primary focus:ring-primary"
            />
            <div>
              <div className="font-semibold text-gray-900 mb-1">תנור יחיד</div>
              <div className="text-sm text-gray-600">החלף את התנור הקיים בתנור החדש</div>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              shouldStack
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="stack"
              checked={shouldStack}
              onChange={() => setShouldStack(true)}
              className="mt-1 text-primary focus:ring-primary"
            />
            <div>
              <div className="font-semibold text-gray-900 mb-1">תנור כפול</div>
              <div className="text-sm text-gray-600">הוסף תנור נוסף מעל התנור הקיים</div>
              <div className="text-xs text-orange-600 mt-1">💡 פתרון חסכוני במקום</div>
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
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Check size={16} />
            <span>אישור</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OvenStackDialog;