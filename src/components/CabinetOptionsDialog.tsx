import React, { useState, useEffect } from 'react';
import { X, Ruler, Maximize2, Check } from 'lucide-react';
import { useKitchen, KitchenItemType } from '../store/KitchenContext';
import { Vector3 } from 'three';

interface CabinetOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // ✅ NEW: Callback for successful placement
  cabinetId: string;
  position: Vector3;
  rotation: number;
}

const CabinetOptionsDialog: React.FC<CabinetOptionsDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
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
    const buffer = -0.30; // ✅ FIXED: ULTRA permissive buffer - allows cabinets to be placed right next to anything
    
    for (const item of placedItems) {
      // ✅ CRITICAL: Skip the cabinet we're trying to place
      if (item.id === cabinetId) continue;
      
      // ✅ FIXED: Account for item rotation in collision detection
      const itemRotation = item.rotation || 0;
      const itemRotatedWidth = Math.abs(Math.cos(itemRotation)) * item.dimensions.width + 
                               Math.abs(Math.sin(itemRotation)) * item.dimensions.depth;
      const itemRotatedDepth = Math.abs(Math.sin(itemRotation)) * item.dimensions.width + 
                               Math.abs(Math.cos(itemRotation)) * item.dimensions.depth;
      
      const itemHalfWidth = itemRotatedWidth / 2;
      const itemHalfDepth = itemRotatedDepth / 2;
      
      // ✅ FIXED: Special handling for stacked ovens - treat as single unit
      if ((item as any).stackedWith) {
        // This is a base oven with something stacked on it - use normal collision detection
        // The visual height doesn't affect horizontal collision
      } else if ((item as any).stackedOn) {
        // This is a stacked oven - skip collision check as it's handled by the base oven
        continue;
      }
      
      const xOverlap = Math.abs(cabinetPos.x - item.position.x) < (cabinetHalfWidth + itemHalfWidth + buffer);
      const zOverlap = Math.abs(cabinetPos.z - item.position.z) < (cabinetHalfDepth + itemHalfDepth + buffer);
      
      // ✅ FIXED: Only report collision if there's MASSIVE overlap (more than 20cm)
      if (xOverlap && zOverlap) {
        const xDistance = Math.abs(cabinetPos.x - item.position.x) - (cabinetHalfWidth + itemHalfWidth);
        const zDistance = Math.abs(cabinetPos.z - item.position.z) - (cabinetHalfDepth + itemHalfDepth);
        
        // ✅ FIXED: Only report collision if overlapping by more than 20cm (MASSIVE overlap)
        if (xDistance < -0.20 && zDistance < -0.20) {
          return item;
        }
      }
    }
    return null;
  };

  const calculateFillWidth = () => {
    const wallMargin = 0.01; // ✅ CRITICAL: ULTRA small wall margin
    const buffer = 0.005; // ✅ CRITICAL: ULTRA small buffer for maximum fill
    
    const isRotated = Math.abs(rotation) > Math.PI / 4 && Math.abs(rotation) < 3 * Math.PI / 4;
    
    console.log('Fill calculation - rotation:', (rotation * 180 / Math.PI).toFixed(1) + '°', 'isRotated:', isRotated);
    
    let leftBoundary, rightBoundary;
    
    if (isRotated) {
      // ✅ FIXED: When rotated, we're filling along the Z-axis (length direction)
      leftBoundary = -kitchenDimensions.length / 2 + wallMargin;
      rightBoundary = kitchenDimensions.length / 2 - wallMargin;
      
      for (const item of placedItems) {
        // ✅ CRITICAL: Skip the cabinet we're trying to place
        if (item.id === cabinetId) continue;
        
        // ✅ CRITICAL: Check if item is in the same row (Z alignment for rotated cabinets)
        if (Math.abs(item.position.x - position.x) < 0.4) { // ✅ FIXED: More generous alignment check
          const itemEdge = item.position.z;
          
          // ✅ FIXED: Account for item rotation
          const itemRotation = item.rotation || 0;
          const itemRotatedDepth = Math.abs(Math.sin(itemRotation)) * item.dimensions.width + 
                                   Math.abs(Math.cos(itemRotation)) * item.dimensions.depth;
          const itemHalfSize = itemRotatedDepth / 2;
          
          if (itemEdge < position.z) {
            leftBoundary = Math.max(leftBoundary, itemEdge + itemHalfSize + buffer);
          } else if (itemEdge > position.z) {
            rightBoundary = Math.min(rightBoundary, itemEdge - itemHalfSize - buffer);
          }
        }
      }
    } else {
      // ✅ FIXED: Normal orientation - filling along X-axis (width direction)
      leftBoundary = -kitchenDimensions.width / 2 + wallMargin;
      rightBoundary = kitchenDimensions.width / 2 - wallMargin;
      
      for (const item of placedItems) {
        // ✅ CRITICAL: Skip the cabinet we're trying to place
        if (item.id === cabinetId) continue;
        
        // ✅ FIXED: Special handling for stacked ovens
        if ((item as any).stackedOn) {
          // Skip stacked ovens - they don't create boundaries, the base oven does
          continue;
        }
        
        // ✅ CRITICAL: Check if item is in the same row (Z alignment for normal cabinets)
        if (Math.abs(item.position.z - position.z) < 0.4) { // ✅ FIXED: More generous alignment check
          const itemEdge = item.position.x;
          
          // ✅ FIXED: Account for item rotation
          const itemRotation = item.rotation || 0;
          const itemRotatedWidth = Math.abs(Math.cos(itemRotation)) * item.dimensions.width + 
                                   Math.abs(Math.sin(itemRotation)) * item.dimensions.depth;
          const itemRotatedDepth = Math.abs(Math.sin(itemRotation)) * item.dimensions.width + 
                                   Math.abs(Math.cos(itemRotation)) * item.dimensions.depth;
          
          const itemHalfSize = itemRotatedWidth / 2; // ✅ FIXED: Use width for X-axis calculation
          
          if (itemEdge < position.x) {
            leftBoundary = Math.max(leftBoundary, itemEdge + itemHalfSize + buffer);
          } else if (itemEdge > position.x) {
            rightBoundary = Math.min(rightBoundary, itemEdge - itemHalfSize - buffer);
          }
        }
      }
    }
    
    const availableWidth = rightBoundary - leftBoundary;
    console.log('Available width calculation:', availableWidth, 'between', leftBoundary, 'and', rightBoundary);
    
    // ✅ CRITICAL: Calculate the FULL width needed to fill from left to right boundary
    const widthToFill = availableWidth;
    
    // ✅ CRITICAL: Also calculate the new position to center the cabinet in the available space
    const newCenterPosition = (leftBoundary + rightBoundary) / 2;
    
    console.log('Fill calculation:', {
      isRotated,
      leftBoundary: leftBoundary.toFixed(2),
      rightBoundary: rightBoundary.toFixed(2),
      availableWidth: availableWidth.toFixed(2),
      widthToFill: widthToFill.toFixed(2),
      newCenterPosition: newCenterPosition.toFixed(2),
      position: { x: position.x.toFixed(2), z: position.z.toFixed(2) }
    });
    
    // ✅ FIXED: Return both width and new position
    return {
      width: Math.max(0.10, Math.min(4.0, widthToFill - 0.005)), // ✅ CRITICAL: Minimal reduction for maximum fill
      newPosition: isRotated ? 
        new Vector3(position.x, position.y, newCenterPosition) : 
        new Vector3(newCenterPosition, position.y, position.z)
    };
  };

  const validateCabinetPlacement = (width: number) => {
    const wallMargin = 0.01; // ✅ CRITICAL: ULTRA small margin for corner placement
    const isRotated = Math.abs(rotation) > Math.PI / 4 && Math.abs(rotation) < 3 * Math.PI / 4;
    
    // ✅ CRITICAL: Calculate actual dimensions based on rotation
    let actualWidth, actualDepth;
    if (isRotated) {
      // When rotated 90°, width becomes depth and depth becomes width
      actualWidth = 0.6; // Cabinet depth becomes the width when rotated
      actualDepth = width; // Cabinet width becomes the depth when rotated
    } else {
      // Normal orientation
      actualWidth = width;
      actualDepth = 0.6;
    }
    
    let minX, maxX, minZ, maxZ;
    
    // ✅ FIXED: Use actual dimensions for boundary calculation with tolerance
    minX = position.x - actualWidth / 2;
    maxX = position.x + actualWidth / 2;
    minZ = position.z - actualDepth / 2;
    maxZ = position.z + actualDepth / 2;
    
    const kitchenMinX = -kitchenDimensions.width / 2 + wallMargin;
    const kitchenMaxX = kitchenDimensions.width / 2 - wallMargin;
    const kitchenMinZ = -kitchenDimensions.length / 2 + wallMargin;
    const kitchenMaxZ = kitchenDimensions.length / 2 - wallMargin;
    
    // ✅ CRITICAL: MASSIVE tolerance for corner placement - prevents boundary errors
    const tolerance = 0.15; // ✅ FIXED: HUGE tolerance (15cm) to prevent corner placement errors
    
    console.log('Boundary validation:', {
      rotation: (rotation * 180 / Math.PI).toFixed(1) + '°',
      isRotated,
      requestedWidth: width,
      actualWidth,
      actualDepth,
      position: { x: position.x.toFixed(2), z: position.z.toFixed(2) },
      bounds: { minX: minX.toFixed(2), maxX: maxX.toFixed(2), minZ: minZ.toFixed(2), maxZ: maxZ.toFixed(2) },
      kitchen: { minX: kitchenMinX.toFixed(2), maxX: kitchenMaxX.toFixed(2), minZ: kitchenMinZ.toFixed(2), maxZ: kitchenMaxZ.toFixed(2) }
    });
    
    // ✅ CRITICAL: ULTRA permissive boundary checking - prevents corner errors
    if (minX < kitchenMinX - tolerance) {
      const overflow = Math.max(0, kitchenMinX - minX - tolerance).toFixed(2);
      if (parseFloat(overflow) > 0.01) { // Only report if significant overflow
      return { valid: false, reason: `יוצא מגבולות המטבח (רוחב) ב-${overflow}מ'` };
      }
    }
    if (maxX > kitchenMaxX + tolerance) {
      const overflow = Math.max(0, maxX - kitchenMaxX - tolerance).toFixed(2);
      if (parseFloat(overflow) > 0.01) { // Only report if significant overflow
      return { valid: false, reason: `יוצא מגבולות המטבח (רוחב) ב-${overflow}מ'` };
      }
    }
    if (minZ < kitchenMinZ - tolerance) {
      const overflow = Math.max(0, kitchenMinZ - minZ - tolerance).toFixed(2);
      if (parseFloat(overflow) > 0.01) { // Only report if significant overflow
      return { valid: false, reason: `יוצא מגבולות המטבח (אורך) ב-${overflow}מ'` };
      }
    }
    if (maxZ > kitchenMaxZ + tolerance) {
      const overflow = Math.max(0, maxZ - kitchenMaxZ - tolerance).toFixed(2);
      if (parseFloat(overflow) > 0.01) { // Only report if significant overflow
      return { valid: false, reason: `יוצא מגבולות המטבח (אורך) ב-${overflow}מ'` };
      }
    }
    
    // ✅ FIXED: Use calculated actual dimensions for collision check
    const collision = checkForCollisions(position, actualWidth, actualDepth); 
    if (collision) {
      return { valid: false, reason: `יתנגש עם ${collision.name}` };
    }
    
    return { valid: true, reason: '' };
  };

  const [fillWidth, setFillWidth] = useState(0.6);
  const [fillPosition, setFillPosition] = useState(position);
  
  useEffect(() => {
    const fillData = calculateFillWidth();
    setFillWidth(fillData.width);
    setFillPosition(fillData.newPosition);
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
        // ✅ CRITICAL: Update position for fill option
        position = fillPosition;
        break;
    }
    
    const validation = validateCabinetPlacement(newWidth);
    if (!validation.valid) {
      alert(`לא ניתן למקם ארון: ${validation.reason}`);
      return;
    }
    
    console.log('Placing cabinet with width:', newWidth);
    
    // ✅ CRITICAL: Place the cabinet
    placeItem(cabinetId, position, rotation);
    
    // ✅ CRITICAL: Update size if different from default
    if (Math.abs(newWidth - 0.6) > 0.01) {
      setTimeout(() => {
        updateCabinetSize(cabinetId, newWidth);
      }, 100);
    }
    
    // ✅ CRITICAL: Call success callback if provided, otherwise just close
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  // ✅ CRITICAL: Handle dialog close properly - reset selection state
  const handleClose = () => {
    console.log('Closing cabinet dialog');
    onClose();
  };

  // ✅ CRITICAL: Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fillValidation = validateCabinetPlacement(fillWidth);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-500 rounded-xl flex items-center justify-center">
              <Ruler className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">הגדרת גודל ארון</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            type="button"
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
               {fillValidation.valid && fillWidth >= 0.3 
                  ? `ימלא ${fillWidth.toFixed(1)} מטר - מלא את כל החלל הפנוי`
                 : fillValidation.valid && fillWidth >= 0.2
                    ? `ימלא ${fillWidth.toFixed(1)} מטר - מלא את כל החלל הפנוי`
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
             {fillValidation.valid && fillWidth < 0.3 && fillWidth >= 0.2 && (
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
            onClick={handleClose}
            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            type="button"
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