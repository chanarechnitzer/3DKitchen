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

  // ✅ IMPROVED: Much better collision detection
  const checkForCollisions = (cabinetPos: Vector3, width: number, depth: number = 0.6) => {
    const cabinetHalfWidth = width / 2;
    const cabinetHalfDepth = depth / 2;
    const buffer = 0.01; // 1cm buffer to prevent overlap
    
    for (const item of placedItems) {
      const itemHalfWidth = item.dimensions.width / 2;
      const itemHalfDepth = item.dimensions.depth / 2;
      
      // Check if bounding boxes overlap
      const xOverlap = Math.abs(cabinetPos.x - item.position.x) < (cabinetHalfWidth + itemHalfWidth + buffer);
      const zOverlap = Math.abs(cabinetPos.z - item.position.z) < (cabinetHalfDepth + itemHalfDepth + buffer);
      
      if (xOverlap && zOverlap) {
        return item; // Return the colliding item
      }
    }
    return null;
  };

  // ✅ COMPLETELY REWRITTEN: Much more accurate fill calculation
  const calculateFillWidth = () => {
    const wallMargin = 0.05;
    const buffer = 0.02; // 2cm buffer between items
    
    // ✅ FIXED: Simple and accurate calculation
    const isRotated = Math.abs(rotation) > Math.PI / 4 && Math.abs(rotation) < 3 * Math.PI / 4;
    
    let leftBoundary, rightBoundary;
    
    if (isRotated) {
      // Cabinet is rotated - width goes along Z axis
      leftBoundary = -kitchenDimensions.length / 2 + wallMargin;
      rightBoundary = kitchenDimensions.length / 2 - wallMargin;
      
      // Find closest obstacles on both sides
      for (const item of placedItems) {
        // Only check items in the same X corridor (within 1 meter)
        if (Math.abs(item.position.x - position.x) < 1.0) {
          const itemEdge = item.position.z;
          const itemHalfSize = Math.max(item.dimensions.width, item.dimensions.depth) / 2;
          
          if (itemEdge < position.z) {
            // Item is behind - update left boundary
            leftBoundary = Math.max(leftBoundary, itemEdge + itemHalfSize + buffer);
          } else if (itemEdge > position.z) {
            // Item is in front - update right boundary  
            rightBoundary = Math.min(rightBoundary, itemEdge - itemHalfSize - buffer);
          }
        }
      }
    } else {
      // Cabinet is normal - width goes along X axis
      leftBoundary = -kitchenDimensions.width / 2 + wallMargin;
      rightBoundary = kitchenDimensions.width / 2 - wallMargin;
      
      // Find closest obstacles on both sides
      for (const item of placedItems) {
        // Only check items in the same Z corridor (within 1 meter)
        if (Math.abs(item.position.z - position.z) < 1.0) {
          const itemEdge = item.position.x;
          const itemHalfSize = Math.max(item.dimensions.width, item.dimensions.depth) / 2;
          
          if (itemEdge < position.x) {
            // Item is to the left - update left boundary
            leftBoundary = Math.max(leftBoundary, itemEdge + itemHalfSize + buffer);
          } else if (itemEdge > position.x) {
            // Item is to the right - update right boundary
            rightBoundary = Math.min(rightBoundary, itemEdge - itemHalfSize - buffer);
          }
        }
      }
    }
    
    // ✅ SIMPLE: Calculate available width
    const availableWidth = rightBoundary - leftBoundary;
    
    // ✅ FIXED: Position cabinet to fill the space
    const centerPosition = (leftBoundary + rightBoundary) / 2;
    
    // Update position to center of available space
    if (isRotated) {
      position.z = centerPosition;
    } else {
      position.x = centerPosition;
    }
    
    console.log('Fill calculation:', {
      isRotated,
      leftBoundary: leftBoundary.toFixed(2),
      rightBoundary: rightBoundary.toFixed(2),
      availableWidth: availableWidth.toFixed(2),
      centerPosition: centerPosition.toFixed(2)
    });
    
    return Math.max(0.3, Math.min(4.0, availableWidth));
  };

  // ✅ SIMPLIFIED: Much simpler collision check
  const checkForCollisions = (cabinetPos: Vector3, width: number, depth: number = 0.6) => {
    const isRotated = Math.abs(rotation) > Math.PI / 4 && Math.abs(rotation) < 3 * Math.PI / 4;
    const buffer = 0.01;
    
    let cabinetMinX, cabinetMaxX, cabinetMinZ, cabinetMaxZ;
    
    if (isRotated) {
      // Rotated cabinet
      cabinetMinX = cabinetPos.x - depth / 2;
      cabinetMaxX = cabinetPos.x + depth / 2;
      cabinetMinZ = cabinetPos.z - width / 2;
      cabinetMaxZ = cabinetPos.z + width / 2;
    } else {
      // Normal cabinet
      cabinetMinX = cabinetPos.x - width / 2;
      cabinetMaxX = cabinetPos.x + width / 2;
      cabinetMinZ = cabinetPos.z - depth / 2;
      cabinetMaxZ = cabinetPos.z + depth / 2;
    }
    
    for (const item of placedItems) {
      const itemMinX = item.position.x - item.dimensions.width / 2;
      const itemMaxX = item.position.x + item.dimensions.width / 2;
      const itemMinZ = item.position.z - item.dimensions.depth / 2;
      const itemMaxZ = item.position.z + item.dimensions.depth / 2;
      
      // Check overlap with buffer
      const xOverlap = !(cabinetMaxX + buffer < itemMinX || cabinetMinX - buffer > itemMaxX);
      const zOverlap = !(cabinetMaxZ + buffer < itemMinZ || cabinetMinZ - buffer > itemMaxZ);
      
      if (xOverlap && zOverlap) {
        return item;
      }
    }
    return null;
  };

  // ✅ SIMPLIFIED: Much simpler boundary check
  const validateCabinetPlacement = (width: number) => {
    const wallMargin = 0.05;
    const isRotated = Math.abs(rotation) > Math.PI / 4 && Math.abs(rotation) < 3 * Math.PI / 4;
    
    let minX, maxX, minZ, maxZ;
    
    if (isRotated) {
      // Rotated cabinet
      minX = position.x - 0.3; // Half depth
      maxX = position.x + 0.3;
      minZ = position.z - width / 2;
      maxZ = position.z + width / 2;
    } else {
      // Normal cabinet  
      minX = position.x - width / 2;
      maxX = position.x + width / 2;
      minZ = position.z - 0.3; // Half depth
      maxZ = position.z + 0.3;
    }
    
    // Check kitchen boundaries
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
    
    // Check collisions
    const collision = checkForCollisions(position, width);
    if (collision) {
      return { valid: false, reason: `יתנגש עם ${collision.name}` };
    }
    
    return { valid: true, reason: '' };
  };
        
        // Check if item is in the same X corridor (within cabinet width)
        if (Math.abs(item.position.x - position.x) < 0.8) {
          if (item.position.z < position.z) {
            // Item is behind cabinet
            minZ = Math.max(minZ, item.position.z + itemHalfDepth + buffer);
          } else if (item.position.z > position.z) {
            // Item is in front of cabinet
            maxZ = Math.min(maxZ, item.position.z - itemHalfDepth - buffer);
          }
        }
      }
      
      availableWidth = Math.max(0, maxZ - minZ);
    } else {
      // Cabinet faces front/back - calculate available space along X axis
      let minX = -halfKitchenWidth + wallMargin + cabinetHalfDepth;
      let maxX = halfKitchenWidth - wallMargin - cabinetHalfDepth;
      
      // Find closest items on both sides
      for (const item of placedItems) {
        const itemHalfWidth = item.dimensions.width / 2;
        const buffer = 0.02; // 2cm buffer
        
        // Check if item is in the same Z corridor (within cabinet depth)
        if (Math.abs(item.position.z - position.z) < 0.8) {
          if (item.position.x < position.x) {
            // Item is to the left of cabinet
            minX = Math.max(minX, item.position.x + itemHalfWidth + buffer);
          } else if (item.position.x > position.x) {
            // Item is to the right of cabinet
            maxX = Math.min(maxX, item.position.x - itemHalfWidth - buffer);
          }
        }
      }
      
      availableWidth = Math.max(0, maxX - minX);
    }
    
    // Return the calculated width, minimum 0.3m, maximum 4.0m
    return Math.max(0.3, Math.min(4.0, availableWidth));
  };

  // ✅ Calculate fill width when dialog opens
  const [fillWidth, setFillWidth] = useState(0.6);
  
  useEffect(() => {
    const calculatedWidth = calculateFillWidth();
    setFillWidth(calculatedWidth);
  }, [position, placedItems, kitchenDimensions]);

  // ✅ IMPROVED: Better validation before placing cabinet
  const validateCabinetPlacement = (width: number) => {
    const halfKitchenWidth = kitchenDimensions.width / 2;
    const halfKitchenLength = kitchenDimensions.length / 2;
    const wallMargin = 0.05;
    const cabinetHalfWidth = width / 2;
    const cabinetHalfDepth = 0.3; // Half of 0.6m depth
    
    // Determine cabinet orientation
    const isRotated = Math.abs(rotation) > Math.PI / 4 && Math.abs(rotation) < 3 * Math.PI / 4;
    
    // Check kitchen boundaries
    if (isRotated) {
      // Cabinet is rotated - width extends along Z axis
      const minZ = position.z - cabinetHalfWidth;
      const maxZ = position.z + cabinetHalfWidth;
      const minX = position.x - cabinetHalfDepth;
      const maxX = position.x + cabinetHalfDepth;
      
      if (minZ < -halfKitchenLength + wallMargin || maxZ > halfKitchenLength - wallMargin) {
        return { valid: false, reason: 'הארון יוצא מגבולות המטבח (אורך)' };
      }
      if (minX < -halfKitchenWidth + wallMargin || maxX > halfKitchenWidth - wallMargin) {
        return { valid: false, reason: 'הארון יוצא מגבולות המטבח (רוחב)' };
      }
    } else {
      // Cabinet is normal - width extends along X axis
      const minX = position.x - cabinetHalfWidth;
      const maxX = position.x + cabinetHalfWidth;
      const minZ = position.z - cabinetHalfDepth;
      const maxZ = position.z + cabinetHalfDepth;
      
      if (minX < -halfKitchenWidth + wallMargin || maxX > halfKitchenWidth - wallMargin) {
        return { valid: false, reason: 'הארון יוצא מגבולות המטבח (רוחב)' };
      }
      if (minZ < -halfKitchenLength + wallMargin || maxZ > halfKitchenLength - wallMargin) {
        return { valid: false, reason: 'הארון יוצא מגבולות המטבח (אורך)' };
      }
    }
    
    // Check for collisions with existing items
    const collision = checkForCollisions(position, width);
    if (collision) {
      return { valid: false, reason: `יתנגש עם ${collision.name}` };
    }
    
    return { valid: true, reason: '' };
  };

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
    
    // ✅ Validate before placing
    const validation = validateCabinetPlacement(newWidth);
    if (!validation.valid) {
      alert(`לא ניתן למקם ארון: ${validation.reason}`);
      return;
    }
    
    console.log('Placing cabinet with width:', newWidth);
    
    // Place the cabinet first
    placeItem(cabinetId, position, rotation);
    
    // Then update the size if it's not the default
    if (Math.abs(newWidth - 0.6) > 0.01) {
      setTimeout(() => {
        updateCabinetSize(cabinetId, newWidth);
      }, 100);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  // ✅ Check if current fill width would cause issues
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
          {/* Keep Default Size */}
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

          {/* Custom Size */}
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

          {/* Fill Space */}
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
                {fillValidation.valid && fillWidth >= 0.6 
                  ? `ימלא ${fillWidth.toFixed(1)} מטר בין הרכיבים`
                  : fillValidation.valid && fillWidth >= 0.3
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
              {fillValidation.valid && fillWidth < 0.6 && fillWidth >= 0.3 && (
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
            disabled={(selectedOption === 'fill' && (!fillValidation.valid || fillWidth < 0.3))}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              (selectedOption === 'fill' && (!fillValidation.valid || fillWidth < 0.3))
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