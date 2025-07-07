import React, { useState, useEffect } from 'react';
import { X, Ruler, Maximize2, Check } from 'lucide-react';
import { useKitchen, KitchenItemType } from '../store/KitchenContext';
import { Vector3 } from 'three';

interface CabinetOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cabinetId: string;
  position: Vector3;
  rotation: number;
}

const CabinetOptionsDialog: React.FC<CabinetOptionsDialogProps> = ({
  isOpen,
  onClose,
  cabinetId,
  position,
  rotation
}) => {
  const { placedItems, updateCabinetSize, kitchenDimensions, placeItem, availableItems } = useKitchen();
  const [selectedOption, setSelectedOption] = useState<'keep' | 'custom' | 'fill'>('keep');
  const [customWidth, setCustomWidth] = useState('0.6');

  const checkForCollisions = (cabinetPos: Vector3, width: number, depth: number = 0.6) => {
    const cabinetHalfWidth = width / 2;
    const cabinetHalfDepth = depth / 2;
    const buffer = -0.08; // ✅ FIXED: More permissive buffer allows filling gaps between items
    
    for (const item of placedItems) {
      // ✅ CRITICAL: Skip the cabinet we're trying to place
      if (item.id === cabinetId) continue;
      
      const itemHalfWidth = item.dimensions.width / 2;
      const itemHalfDepth = item.dimensions.depth / 2;
      
      const xOverlap = Math.abs(cabinetPos.x - item.position.x) < (cabinetHalfWidth + itemHalfWidth + buffer);
      const zOverlap = Math.abs(cabinetPos.z - item.position.z) < (cabinetHalfDepth + itemHalfDepth + buffer);
      
      // ✅ FIXED: Only report collision if there's significant overlap
      if (xOverlap && zOverlap) {
        const xDistance = Math.abs(cabinetPos.x - item.position.x) - (cabinetHalfWidth + itemHalfWidth);
        const zDistance = Math.abs(cabinetPos.z - item.position.z) - (cabinetHalfDepth + itemHalfDepth);
        
        // Only report collision if overlapping by more than 3cm
        if (xDistance < -0.03 && zDistance < -0.03) {
          return item;
        }
      }
    }
    return null;
  };

  const calculateFillWidth = () => {
    const wallMargin = 0.05;
    const buffer = 0.02; // Small buffer between items
    
    const isRotated = Math.abs(rotation) > Math.PI / 4 && Math.abs(rotation) < 3 * Math.PI / 4;
    
    let leftBoundary, rightBoundary;
    
    if (isRotated) {
      leftBoundary = -kitchenDimensions.length / 2 + wallMargin;
      rightBoundary = kitchenDimensions.length / 2 - wallMargin;
      
      for (const item of placedItems) {
        // ✅ CRITICAL: Skip the cabinet we're trying to place
        if (item.id === cabinetId) continue;
        
        if (Math.abs(item.position.x - position.x) < 0.4) { // ✅ FIXED: More precise alignment check
          const itemEdge = item.position.z;
          const itemHalfSize = (isRotated ? item.dimensions.width : item.dimensions.depth) / 2;
          
          if (itemEdge < position.z) {
            leftBoundary = Math.max(leftBoundary, itemEdge + itemHalfSize + buffer);
          } else if (itemEdge > position.z) {
            rightBoundary = Math.min(rightBoundary, itemEdge - itemHalfSize - buffer);
          }
        }
      }
    } else {
      leftBoundary = -kitchenDimensions.width / 2 + wallMargin;
      rightBoundary = kitchenDimensions.width / 2 - wallMargin;
      
      for (const item of placedItems) {
        // ✅ CRITICAL: Skip the cabinet we're trying to place
        if (item.id === cabinetId) continue;
        
        if (Math.abs(item.position.z - position.z) < 0.35) { // ✅ FIXED: More precise alignment check
          const itemEdge = item.position.x;
          const itemHalfSize = (isRotated ? item.dimensions.depth : item.dimensions.width) / 2;
          
          if (itemEdge < position.x) {
            leftBoundary = Math.max(leftBoundary, itemEdge + itemHalfSize + 0.01); // Minimal gap
          } else if (itemEdge > position.x) {
            rightBoundary = Math.min(rightBoundary, itemEdge - itemHalfSize - 0.01); // Minimal gap
          }
        }
      }
    }
    
    const availableWidth = rightBoundary - leftBoundary;
    console.log('Available width calculation:', availableWidth, 'between', leftBoundary, 'and', rightBoundary);
    // ✅ FIXED: Only center if there's enough space, otherwise keep original position
    const centerPosition = (leftBoundary + rightBoundary) / 2;
    const halfCabinetSize = availableWidth / 2;
    
    // ✅ FIXED: Only adjust position if cabinet fits and there's benefit to centering
    if (availableWidth > 0.4) { // Only center if there's meaningful space
      if (isRotated) {
        // Check if centering would keep cabinet within bounds
        if (centerPosition - halfCabinetSize >= leftBoundary && centerPosition + halfCabinetSize <= rightBoundary) {
          position.z = centerPosition;
        }
      } else {
        if (centerPosition - halfCabinetSize >= leftBoundary && centerPosition + halfCabinetSize <= rightBoundary) {
          position.x = centerPosition;
        }
      }
    }
    
    console.log('Fill calculation:', {
      isRotated,
      leftBoundary: leftBoundary.toFixed(2),
      rightBoundary: rightBoundary.toFixed(2),
      availableWidth: availableWidth.toFixed(2),
      centerPosition: centerPosition.toFixed(2)
    });
    
    // ✅ FIXED: Better width calculation with minimum viable size
    return Math.max(0.2, Math.min(4.0, availableWidth - 0.02)); // Minimal margin for safety
  };

  const validateCabinetPlacement = (width: number) => {
    const wallMargin = 0.05;
    const isRotated = Math.abs(rotation) > Math.PI / 4 && Math.abs(rotation) < 3 * Math.PI / 4;
    
    let minX, maxX, minZ, maxZ;
    
    if (isRotated) {
      minX = position.x - 0.3;
      maxX = position.x + 0.3;
      minZ = position.z - width / 2;
      maxZ = position.z + width / 2;
    } else {
      minX = position.x - width / 2;
      maxX = position.x + width / 2;
      minZ = position.z - 0.3;
      maxZ = position.z + 0.3;
    }
    
    const kitchenMinX = -kitchenDimensions.width / 2 + wallMargin;
    const kitchenMaxX = kitchenDimensions.width / 2 - wallMargin;
    const kitchenMinZ = -kitchenDimensions.length / 2 + wallMargin;
    const kitchenMaxZ = kitchenDimensions.length / 2 - wallMargin;
    
    if (minX < kitchenMinX || maxX > kitchenMaxX) {
      return { valid: false, reason: 'יוצא מגבולות המטבח (רוחב)' };
    }
    if (minZ < kitchenMinZ || maxZ > kitchenMaxZ) {
      return { valid: false, reason: 'יוצא מגבולות המטבח (אורך)' };
    }
    
    // ✅ FIXED: Use appropriate depth based on rotation
    const depth = isRotated ? width : 0.6;
    const actualWidth = isRotated ? 0.6 : width;
    const collision = checkForCollisions(position, actualWidth, depth); 
    if (collision) {
      return { valid: false, reason: `יתנגש עם ${collision.name}` };
    }
    
    return { valid: true, reason: '' };
  };

  const [fillWidth, setFillWidth] = useState(0.6);
  
  useEffect(() => {
    const calculatedWidth = calculateFillWidth();
    setFillWidth(calculatedWidth);
  }, [position, placedItems, kitchenDimensions]);

  const handleConfirm = () => {
    let newWidth = 0.6;
    
    switch (selectedOption) {
      case 'keep':
        newWidth = 0.6;
        break;
      case 'custom':
        newWidth = Math.max(0.3, Math.min(parseFloat(customWidth) || 0.6, 4.0));
        break;
      case 'fill':
        newWidth = fillWidth;
        break;
    }
    
    const validation = validateCabinetPlacement(newWidth);
    if (!validation.valid) {
      alert(`לא ניתן למקם ארון: ${validation.reason}`);
      return;
    }
    
    console.log('Placing cabinet with width:', newWidth);
    
    placeItem(cabinetId, position, rotation);
    
    if (Math.abs(newWidth - 0.6) > 0.01) {
      setTimeout(() => {
        updateCabinetSize(cabinetId, newWidth);
      }, 100);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  const fillValidation = validateCabinetPlacement(fillWidth);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-500 rounded-xl flex items-center justify-center">
              <Ruler className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">הגדרת גודל ארון</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          בחר את הגודל הרצוי עבור הארון החדש
        </p>
        
        <div className="space-y-4">
          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedOption === 'keep'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="cabinetSize"
              value="keep"
              checked={selectedOption === 'keep'}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">השאר באותו גודל</div>
              <div className="text-sm text-gray-600">0.6 מטר (גודל סטנדרטי)</div>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedOption === 'custom'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="cabinetSize"
              value="custom"
              checked={selectedOption === 'custom'}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">קבע גודל מותאם</div>
              <div className="text-sm text-gray-600 mb-2">בחר רוחב בין 0.3 ל-4.0 מטר</div>
              {selectedOption === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    min="0.3"
                    max="4.0"
                    step="0.1"
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:border-primary focus:ring-0"
                  />
                  <span className="text-sm text-gray-600">מטר</span>
                </div>
              )}
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedOption === 'fill'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="cabinetSize"
              value="fill"
              checked={selectedOption === 'fill'}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="text-primary focus:ring-primary"
              disabled={!fillValidation.valid || fillWidth < 0.3}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">מלא את החלל</div>
              <div className="text-sm text-gray-600">
                {fillValidation.valid && fillWidth >= 0.4 
                  ? `ימלא ${fillWidth.toFixed(1)} מטר בין הרכיבים`
                  : fillValidation.valid && fillWidth >= 0.2
                    ? `ימלא ${fillWidth.toFixed(1)} מטר (מקום מוגבל)`
                    : !fillValidation.valid
                      ? `לא ניתן: ${fillValidation.reason}`
                      : 'אין מספיק מקום למילוי'
                }
              </div>
              {!fillValidation.valid && (
                <div className="text-xs text-red-600 mt-1">
                  ❌ {fillValidation.reason}
                </div>
              )}
              {fillValidation.valid && fillWidth < 0.4 && fillWidth >= 0.2 && (
                <div className="text-xs text-yellow-600 mt-1">
                  ⚠️ מקום מוגבל - ארון קטן מהסטנדרט
                </div>
              )}
            </div>
            <Maximize2 className={!fillValidation.valid || fillWidth < 0.3 ? "text-gray-300" : "text-gray-400"} size={20} />
          </label>
        </div>
        
        <div className="flex gap-3 pt-6">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            ביטול
          </button>
          <button 
            onClick={handleConfirm}
            disabled={(selectedOption === 'fill' && (!fillValidation.valid || fillWidth < 0.2))}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              (selectedOption === 'fill' && (!fillValidation.valid || fillWidth < 0.2))
                ? 'text-gray-500 bg-gray-200 cursor-not-allowed'
                : 'text-white bg-gradient-to-r from-primary to-yellow-500 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            <Check size={16} />
            אישור
          </button>
        </div>
      </div>
    </div>
  );
};

export default CabinetOptionsDialog;