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
    const wallBuffer = 0.05; // 5cm from walls
    const itemBuffer = 0.02; // 2cm between items
    const halfKitchenWidth = kitchenDimensions.width / 2;
    const halfKitchenLength = kitchenDimensions.length / 2;
    
    console.log('=== IMPROVED Cabinet Fill Calculation ===');
    console.log('Cabinet position:', { x: position.x, z: position.z });
    
    // ✅ STEP 1: Find the absolute boundaries (walls)
    const absoluteLeftBoundary = -halfKitchenWidth + wallBuffer;
    const absoluteRightBoundary = halfKitchenWidth - wallBuffer;
    const absoluteBackBoundary = -halfKitchenLength + wallBuffer;
    const absoluteFrontBoundary = halfKitchenLength - wallBuffer;
    
    // ✅ STEP 2: Find items that could limit our expansion in each direction
    const findLimitingItems = () => {
      const tolerance = 1.0; // 1 meter tolerance for considering items "in line"
      
      const leftItems = placedItems.filter(item => {
        const itemRightEdge = item.position.x + item.dimensions.width / 2;
        return itemRightEdge <= position.x - 0.01 && // Item is to the left
               Math.abs(item.position.z - position.z) <= tolerance; // In same line
      }).sort((a, b) => {
        const aRightEdge = a.position.x + a.dimensions.width / 2;
        const bRightEdge = b.position.x + b.dimensions.width / 2;
        return bRightEdge - aRightEdge; // Closest to cabinet first
      });
      
      const rightItems = placedItems.filter(item => {
        const itemLeftEdge = item.position.x - item.dimensions.width / 2;
        return itemLeftEdge >= position.x + 0.01 && // Item is to the right
               Math.abs(item.position.z - position.z) <= tolerance; // In same line
      }).sort((a, b) => {
        const aLeftEdge = a.position.x - a.dimensions.width / 2;
        const bLeftEdge = b.position.x - b.dimensions.width / 2;
        return aLeftEdge - bLeftEdge; // Closest to cabinet first
      });
      
      const backItems = placedItems.filter(item => {
        const itemFrontEdge = item.position.z + item.dimensions.depth / 2;
        return itemFrontEdge <= position.z - 0.01 && // Item is behind
               Math.abs(item.position.x - position.x) <= tolerance; // In same line
      }).sort((a, b) => {
        const aFrontEdge = a.position.z + a.dimensions.depth / 2;
        const bFrontEdge = b.position.z + b.dimensions.depth / 2;
        return bFrontEdge - aFrontEdge; // Closest to cabinet first
      });
      
      const frontItems = placedItems.filter(item => {
        const itemBackEdge = item.position.z - item.dimensions.depth / 2;
        return itemBackEdge >= position.z + 0.01 && // Item is in front
               Math.abs(item.position.x - position.x) <= tolerance; // In same line
      }).sort((a, b) => {
        const aBackEdge = a.position.z - a.dimensions.depth / 2;
        const bBackEdge = b.position.z - b.dimensions.depth / 2;
        return aBackEdge - bBackEdge; // Closest to cabinet first
      });
      
      return { leftItems, rightItems, backItems, frontItems };
    };
    
    const { leftItems, rightItems, backItems, frontItems } = findLimitingItems();
    
    console.log('Found limiting items:', {
      left: leftItems.length,
      right: rightItems.length,
      back: backItems.length,
      front: frontItems.length
    });
    
    // ✅ STEP 3: Calculate actual boundaries considering items
    let leftBoundary = absoluteLeftBoundary;
    let rightBoundary = absoluteRightBoundary;
    let backBoundary = absoluteBackBoundary;
    let frontBoundary = absoluteFrontBoundary;
    
    if (leftItems.length > 0) {
      const closestLeftItem = leftItems[0];
      leftBoundary = Math.max(leftBoundary, closestLeftItem.position.x + closestLeftItem.dimensions.width / 2 + itemBuffer);
    }
    
    if (rightItems.length > 0) {
      const closestRightItem = rightItems[0];
      rightBoundary = Math.min(rightBoundary, closestRightItem.position.x - closestRightItem.dimensions.width / 2 - itemBuffer);
    }
    
    if (backItems.length > 0) {
      const closestBackItem = backItems[0];
      backBoundary = Math.max(backBoundary, closestBackItem.position.z + closestBackItem.dimensions.depth / 2 + itemBuffer);
    }
    
    if (frontItems.length > 0) {
      const closestFrontItem = frontItems[0];
      frontBoundary = Math.min(frontBoundary, closestFrontItem.position.z - closestFrontItem.dimensions.depth / 2 - itemBuffer);
    }
    
    // ✅ STEP 4: Calculate available space in each direction
    const availableSpaceX = Math.max(0, rightBoundary - leftBoundary);
    const availableSpaceZ = Math.max(0, frontBoundary - backBoundary);
    
    console.log('Available spaces:', {
      X: availableSpaceX.toFixed(2),
      Z: availableSpaceZ.toFixed(2)
    });
    
    // ✅ STEP 5: Choose the best direction with improved logic
    let finalWidth = 0.6;
    let chosenDirection = 'none';
    
    // Priority 1: If there are items on both sides in one direction, prefer that
    const hasItemsBothSidesX = leftItems.length > 0 && rightItems.length > 0;
    const hasItemsBothSidesZ = backItems.length > 0 && frontItems.length > 0;
    
    if (hasItemsBothSidesX && !hasItemsBothSidesZ && availableSpaceX >= 0.6) {
      finalWidth = Math.min(availableSpaceX, 4.0);
      chosenDirection = 'X (items both sides)';
    } else if (hasItemsBothSidesZ && !hasItemsBothSidesX && availableSpaceZ >= 0.6) {
      finalWidth = Math.min(availableSpaceZ, 4.0);
      chosenDirection = 'Z (items both sides)';
    } 
    // Priority 2: Choose direction with more space
    else if (availableSpaceX >= 0.6 || availableSpaceZ >= 0.6) {
      if (availableSpaceX >= availableSpaceZ && availableSpaceX >= 0.6) {
        finalWidth = Math.min(availableSpaceX, 4.0);
        chosenDirection = 'X (more space)';
      } else if (availableSpaceZ >= 0.6) {
        finalWidth = Math.min(availableSpaceZ, 4.0);
        chosenDirection = 'Z (more space)';
      }
    }
    // Priority 3: Take any available space above minimum
    else if (availableSpaceX >= 0.3) {
      finalWidth = Math.min(availableSpaceX, 4.0);
      chosenDirection = 'X (limited)';
    } else if (availableSpaceZ >= 0.3) {
      finalWidth = Math.min(availableSpaceZ, 4.0);
      chosenDirection = 'Z (limited)';
    } else {
      finalWidth = 0.3;
      chosenDirection = 'minimum';
    }
    
    console.log('Final decision:', {
      chosenDirection,
      finalWidth: finalWidth.toFixed(2),
      hasItemsBothSidesX,
      hasItemsBothSidesZ
    });
    
    // ✅ STEP 6: Validate that the chosen size won't cause collisions
    const collision = checkForCollisions(position, finalWidth);
    if (collision) {
      console.log('Collision detected with:', collision.name, '- reducing size');
      finalWidth = Math.max(0.3, finalWidth * 0.8); // Reduce by 20%
    }
    
    return Math.max(0.3, Math.min(finalWidth, 4.0));
  };

  // ✅ Calculate fill width when dialog opens
  const [fillWidth, setFillWidth] = useState(0.6);
  
  useEffect(() => {
    const calculatedWidth = calculateFillWidth();
    setFillWidth(calculatedWidth);
  }, [position, placedItems, kitchenDimensions]);

  // ✅ IMPROVED: Better validation before placing cabinet
  const validateCabinetPlacement = (width: number) => {
    // Check for collisions
    const collision = checkForCollisions(position, width);
    if (collision) {
      return { valid: false, reason: `יתנגש עם ${collision.name}` };
    }
    
    // Check if cabinet stays within kitchen bounds
    const halfWidth = width / 2;
    const halfDepth = 0.3; // Cabinet depth / 2
    const wallBuffer = 0.05;
    
    const leftEdge = position.x - halfWidth;
    const rightEdge = position.x + halfWidth;
    const backEdge = position.z - halfDepth;
    const frontEdge = position.z + halfDepth;
    
    const kitchenLeft = -kitchenDimensions.width / 2 + wallBuffer;
    const kitchenRight = kitchenDimensions.width / 2 - wallBuffer;
    const kitchenBack = -kitchenDimensions.length / 2 + wallBuffer;
    const kitchenFront = kitchenDimensions.length / 2 - wallBuffer;
    
    if (leftEdge < kitchenLeft || rightEdge > kitchenRight || 
        backEdge < kitchenBack || frontEdge > kitchenFront) {
      return { valid: false, reason: 'יוצא מגבולות המטבח' };
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