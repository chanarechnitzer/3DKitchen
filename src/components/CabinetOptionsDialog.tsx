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

  // Calculate available space for filling
  const calculateFillWidth = () => {
    const wallTolerance = 0.1; // 10cm tolerance for wall detection
    const itemTolerance = 0.5; // 50cm tolerance for finding items in vicinity
    const halfKitchenWidth = kitchenDimensions.width / 2;
    const halfKitchenLength = kitchenDimensions.length / 2;
    const buffer = 0.05; // 5cm buffer between items
    
    console.log('=== Cabinet Fill Calculation ===');
    console.log('Cabinet position:', { x: position.x, z: position.z });
    console.log('Kitchen dimensions:', kitchenDimensions);
    
    // ✅ FIXED: Get ALL placed items (the cabinet we're placing isn't in placedItems yet)
    const otherItems = placedItems; // No need to filter - cabinet isn't placed yet
    console.log('Other items:', otherItems.map(item => ({
      name: item.name,
      type: item.type,
      position: { x: item.position.x, z: item.position.z },
      dimensions: item.dimensions
    })));
    
    // ✅ IMPROVED: Better wall detection
    const distanceToLeftWall = Math.abs(position.x + halfKitchenWidth);
    const distanceToRightWall = Math.abs(position.x - halfKitchenWidth);
    const distanceToBackWall = Math.abs(position.z + halfKitchenLength);
    const distanceToFrontWall = Math.abs(position.z - halfKitchenLength);
    
    const isAgainstLeftWall = distanceToLeftWall < wallTolerance;
    const isAgainstRightWall = distanceToRightWall < wallTolerance;
    const isAgainstBackWall = distanceToBackWall < wallTolerance;
    const isAgainstFrontWall = distanceToFrontWall < wallTolerance;
    
    console.log('Wall distances:', { left: distanceToLeftWall, right: distanceToRightWall, back: distanceToBackWall, front: distanceToFrontWall });
    console.log('Against walls:', { left: isAgainstLeftWall, right: isAgainstRightWall, back: isAgainstBackWall, front: isAgainstFrontWall });
    
    // ✅ IMPROVED: Better direction detection with proper item dimensions
    const findClosestItemInDirection = (direction: 'left' | 'right' | 'up' | 'down') => {
      let closestItem = null;
      let closestDistance = Infinity;
      
      for (const item of otherItems) {
        const itemHalfWidth = item.dimensions.width / 2;
        const itemHalfDepth = item.dimensions.depth / 2;
        let edgeDistance = 0;
        let isInDirection = false;
        let isInSameLine = false;
        
        switch (direction) {
          case 'left': // Negative X direction
            const itemRightEdge = item.position.x + itemHalfWidth;
            if (itemRightEdge < position.x - 0.05) { // Item is to the left
              edgeDistance = position.x - itemRightEdge;
              isInDirection = true;
              // Check if items are roughly in the same line (Z axis)
              isInSameLine = Math.abs(item.position.z - position.z) < itemTolerance;
            }
            break;
          case 'right': // Positive X direction
            const itemLeftEdge = item.position.x - itemHalfWidth;
            if (itemLeftEdge > position.x + 0.05) { // Item is to the right
              edgeDistance = itemLeftEdge - position.x;
              isInDirection = true;
              isInSameLine = Math.abs(item.position.z - position.z) < itemTolerance;
            }
            break;
          case 'up': // Negative Z direction (back)
            const itemFrontEdge = item.position.z + itemHalfDepth;
            if (itemFrontEdge < position.z - 0.05) { // Item is behind
              edgeDistance = position.z - itemFrontEdge;
              isInDirection = true;
              isInSameLine = Math.abs(item.position.x - position.x) < itemTolerance;
            }
            break;
          case 'down': // Positive Z direction (front)
            const itemBackEdge = item.position.z - itemHalfDepth;
            if (itemBackEdge > position.z + 0.05) { // Item is in front
              edgeDistance = itemBackEdge - position.z;
              isInDirection = true;
              isInSameLine = Math.abs(item.position.x - position.x) < itemTolerance;
            }
            break;
        }
        
        // ✅ IMPROVED: Prioritize items that are in the same line, but also consider nearby items
        if (isInDirection && (isInSameLine || edgeDistance < 1.0)) {
          // Give priority to items in the same line
          const adjustedDistance = isInSameLine ? edgeDistance : edgeDistance + 0.5;
          
          if (adjustedDistance < closestDistance) {
            closestDistance = adjustedDistance;
            closestItem = item;
          }
        }
      }
      
      return { item: closestItem, distance: closestDistance };
    };
    
    const leftResult = findClosestItemInDirection('left');
    const rightResult = findClosestItemInDirection('right');
    const upResult = findClosestItemInDirection('up');
    const downResult = findClosestItemInDirection('down');
    
    console.log('Closest items with distances:', {
      left: leftResult.item ? `${leftResult.item.name} (${leftResult.item.type}) at distance ${leftResult.distance.toFixed(2)}m` : 'none',
      right: rightResult.item ? `${rightResult.item.name} (${rightResult.item.type}) at distance ${rightResult.distance.toFixed(2)}m` : 'none',
      up: upResult.item ? `${upResult.item.name} (${upResult.item.type}) at distance ${upResult.distance.toFixed(2)}m` : 'none',
      down: downResult.item ? `${downResult.item.name} (${downResult.item.type}) at distance ${downResult.distance.toFixed(2)}m` : 'none'
    });
    
    // ✅ IMPROVED: Calculate boundaries more accurately
    let xAxisLeftBoundary = -halfKitchenWidth + 0.05; // Default to wall
    let xAxisRightBoundary = halfKitchenWidth - 0.05; // Default to wall
    let zAxisUpBoundary = -halfKitchenLength + 0.05; // Default to wall
    let zAxisDownBoundary = halfKitchenLength - 0.05; // Default to wall
    
    // Adjust boundaries based on found items
    if (leftResult.item) {
      const itemRightEdge = leftResult.item.position.x + leftResult.item.dimensions.width / 2;
      xAxisLeftBoundary = Math.max(xAxisLeftBoundary, itemRightEdge + buffer);
    }
    if (rightResult.item) {
      const itemLeftEdge = rightResult.item.position.x - rightResult.item.dimensions.width / 2;
      xAxisRightBoundary = Math.min(xAxisRightBoundary, itemLeftEdge - buffer);
    }
    if (upResult.item) {
      const itemFrontEdge = upResult.item.position.z + upResult.item.dimensions.depth / 2;
      zAxisUpBoundary = Math.max(zAxisUpBoundary, itemFrontEdge + buffer);
    }
    if (downResult.item) {
      const itemBackEdge = downResult.item.position.z - downResult.item.dimensions.depth / 2;
      zAxisDownBoundary = Math.min(zAxisDownBoundary, itemBackEdge - buffer);
    }
    
    // ✅ IMPROVED: Account for cabinet's own position and size
    const cabinetHalfWidth = 0.3; // Half of default cabinet width
    const cabinetHalfDepth = 0.3; // Half of default cabinet depth
    
    // Calculate how much space we can fill in each direction
    const maxWidthInX = Math.max(0, xAxisRightBoundary - xAxisLeftBoundary);
    const maxWidthInZ = Math.max(0, zAxisDownBoundary - zAxisUpBoundary);
    
    console.log('Calculated boundaries:', {
      xAxis: `${xAxisLeftBoundary.toFixed(2)} to ${xAxisRightBoundary.toFixed(2)} = ${maxWidthInX.toFixed(2)}m`,
      zAxis: `${zAxisUpBoundary.toFixed(2)} to ${zAxisDownBoundary.toFixed(2)} = ${maxWidthInZ.toFixed(2)}m`
    });
    
    // ✅ IMPROVED: Better logic for choosing direction
    let finalWidth = 0.6;
    let chosenAxis = 'none';
    let reason = '';
    
    // Check if there are items on both sides in each axis
    const hasItemsOnBothSidesX = leftResult.item && rightResult.item;
    const hasItemsOnBothSidesZ = upResult.item && downResult.item;
    
    // Priority 1: If there are items on both sides in one axis, prefer that axis
    if (hasItemsOnBothSidesX && !hasItemsOnBothSidesZ && maxWidthInX > 0.3) {
      finalWidth = Math.min(maxWidthInX, 4.0);
      chosenAxis = 'x';
      reason = 'Items on both sides in X axis';
    } else if (hasItemsOnBothSidesZ && !hasItemsOnBothSidesX && maxWidthInZ > 0.3) {
      finalWidth = Math.min(maxWidthInZ, 4.0);
      chosenAxis = 'z';
      reason = 'Items on both sides in Z axis';
    } 
    // Priority 2: Choose the axis with more space (if both have reasonable space)
    else if (maxWidthInX > 0.6 && maxWidthInZ > 0.6) {
      if (maxWidthInX >= maxWidthInZ) {
        finalWidth = Math.min(maxWidthInX, 4.0);
        chosenAxis = 'x';
        reason = 'More space in X axis';
      } else {
        finalWidth = Math.min(maxWidthInZ, 4.0);
        chosenAxis = 'z';
        reason = 'More space in Z axis';
      }
    }
    // Priority 3: Take any available space above minimum
    else if (maxWidthInX > 0.3) {
      finalWidth = Math.min(maxWidthInX, 4.0);
      chosenAxis = 'x';
      reason = 'Limited space in X axis';
    } else if (maxWidthInZ > 0.3) {
      finalWidth = Math.min(maxWidthInZ, 4.0);
      chosenAxis = 'z';
      reason = 'Limited space in Z axis';
    } else {
      finalWidth = 0.3; // Minimum size
      chosenAxis = 'none';
      reason = 'Insufficient space - using minimum';
    }
    
    console.log('Final decision:', {
      chosenAxis,
      finalWidth: finalWidth.toFixed(2),
      reason,
      hasItemsOnBothSidesX,
      hasItemsOnBothSidesZ,
      maxWidthInX: maxWidthInX.toFixed(2),
      maxWidthInZ: maxWidthInZ.toFixed(2)
    });
    
    return Math.max(0.3, finalWidth); // Ensure minimum size
  };

  // ✅ IMPROVED: Calculate fill width when dialog opens and when position changes
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
    
    console.log('Placing cabinet with width:', newWidth);
    
    // Place the cabinet first
    placeItem(cabinetId, position, rotation);
    
    // Then update the size if it's not the default
    if (Math.abs(newWidth - 0.6) > 0.01) { // Only update if significantly different
      setTimeout(() => {
        updateCabinetSize(cabinetId, newWidth);
      }, 100);
    }
    
    onClose();
  };

  if (!isOpen) return null;

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
              disabled={fillWidth < 0.3}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">מלא את החלל</div>
              <div className="text-sm text-gray-600">
                {fillWidth >= 0.6 
                  ? `ימלא ${fillWidth.toFixed(1)} מטר בין הרכיבים`
                  : fillWidth >= 0.3
                    ? `ימלא ${fillWidth.toFixed(1)} מטר (מקום מוגבל)`
                    : 'אין מספיק מקום למילוי (פחות מ-30 ס"מ)'
                }
              </div>
              {fillWidth < 0.6 && fillWidth >= 0.3 && (
                <div className="text-xs text-yellow-600 mt-1">
                  ⚠️ מקום מוגבל - ארון קטן מהסטנדרט
                </div>
              )}
              {fillWidth < 0.3 && (
                <div className="text-xs text-red-600 mt-1">
                  ❌ אין מספיק מקום - נדרש לפחות 30 ס"מ
                </div>
              )}
            </div>
            <Maximize2 className={fillWidth < 0.3 ? "text-gray-300" : "text-gray-400"} size={20} />
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
            disabled={selectedOption === 'fill' && fillWidth < 0.3}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              selectedOption === 'fill' && fillWidth < 0.3
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