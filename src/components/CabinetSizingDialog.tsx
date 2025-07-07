import React, { useState, useEffect } from 'react';
import { X, Ruler, Check, AlertCircle } from 'lucide-react';

interface CabinetSizingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (width: number, autoFill: boolean) => void;
  defaultWidth: number;
  suggestedWidth?: number;
  gapInfo?: {
    hasGap: boolean;
    gapSize: number;
    position: string;
  };
}

const CabinetSizingDialog: React.FC<CabinetSizingDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultWidth,
  suggestedWidth,
  gapInfo
}) => {
  const [width, setWidth] = useState(defaultWidth.toString());
  const [autoFill, setAutoFill] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWidth(defaultWidth.toString());
      setAutoFill(false);
      setError('');
    }
  }, [isOpen, defaultWidth]);

  const validateWidth = (value: number): boolean => {
    return !isNaN(value) && value >= 0.3 && value <= 3.0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const widthNum = parseFloat(width);
    
    if (!validateWidth(widthNum)) {
      setError('רוחב הארון חייב להיות בין 30 ס"מ ל-3 מטר');
      return;
    }
    
    onConfirm(widthNum, autoFill);
  };

  const handleQuickSelect = (selectedWidth: number) => {
    setWidth(selectedWidth.toString());
    setError('');
  };

  if (!isOpen) return null;

  const commonWidths = [0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Ruler className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">הגדרת רוחב הארון</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="סגור"
          >
            <X size={24} />
          </button>
        </div>

        {/* Gap Detection Info */}
        {gapInfo?.hasGap && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-yellow-600" size={16} />
              <span className="font-medium text-yellow-800 text-sm">רווח זוהה!</span>
            </div>
            <p className="text-yellow-700 text-xs mb-2">
              יש רווח של {gapInfo.gapSize.toFixed(2)} מטר {gapInfo.position}
            </p>
            {suggestedWidth && (
              <button
                onClick={() => {
                  setWidth(suggestedWidth.toString());
                  setAutoFill(true);
                }}
                className="w-full px-3 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                מלא את הרווח ({suggestedWidth.toFixed(2)} מ')
              </button>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Manual Width Input */}
          <div className="space-y-2">
            <label htmlFor="width" className="block text-sm font-semibold text-gray-700">
              רוחב הארון (מטר)
            </label>
            <input
              id="width"
              type="number"
              value={width}
              onChange={(e) => {
                setWidth(e.target.value);
                setError('');
                setAutoFill(false);
              }}
              step="0.1"
              min="0.3"
              max="3.0"
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center font-medium focus:border-blue-500 focus:ring-0 transition-colors"
              required
            />
          </div>

          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              רוחבים נפוצים
            </label>
            <div className="grid grid-cols-4 gap-2">
              {commonWidths.map((commonWidth) => (
                <button
                  key={commonWidth}
                  type="button"
                  onClick={() => handleQuickSelect(commonWidth)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                    parseFloat(width) === commonWidth
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {commonWidth}מ'
                </button>
              ))}
            </div>
          </div>

          {/* Auto-fill Option */}
          {gapInfo?.hasGap && suggestedWidth && (
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={autoFill}
                  onChange={(e) => {
                    setAutoFill(e.target.checked);
                    if (e.target.checked && suggestedWidth) {
                      setWidth(suggestedWidth.toString());
                    }
                  }}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">מלא רווח אוטומטית</div>
                  <div className="text-sm text-gray-600">
                    התאם את הרוחב למלא את הרווח הקיים ({suggestedWidth.toFixed(2)} מ')
                  </div>
                </div>
              </label>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="text-gray-600" size={14} />
              <span className="font-medium text-gray-900 text-sm">תצוגה מקדימה</span>
            </div>
            <div className="text-sm text-gray-700">
              <p>רוחב: <strong>{parseFloat(width) || 0} מטר</strong></p>
              <p>עומק: <strong>0.6 מטר</strong> (סטנדרטי)</p>
              <p>גובה: <strong>0.85 מטר</strong> (עם משטח)</p>
            </div>
          </div>
          
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
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Check size={16} />
              <span>אישור</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CabinetSizingDialog;