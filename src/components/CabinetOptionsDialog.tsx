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
    const wallTolerance = 0.15; // 15cm tolerance for wall detection
    const itemTolerance = 0.3; // 30cm tolerance for finding items in vicinity
    const halfKitchenWidth = kitchenDimensions.width / 2;
    const halfKitchenLength = kitchenDimensions.length / 2;
    const buffer = 0.05; // 5cm buffer between items
    
    console.log('=== Cabinet Fill Calculation ===');
    console.log('Cabinet position:', { x: position.x, z: position.z });
    console.log('Kitchen dimensions:', kitchenDimensions);
    
    // Find all placed items (excluding the current cabinet)
    const otherItems = placedItems.filter(item => item.id !== cabinetId);
    console.log('Other items:', otherItems.map(item => ({
      name: item.name,
      position: { x: item.position.x, z: item.position.z },
      dimensions: item.dimensions
    })));
    
    // Check if cabinet is against a wall
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
    
    // NEW APPROACH: Find the closest items in all 4 directions
    const findClosestItemInDirection = (direction: 'left' | 'right' | 'up' | 'down') => {
      let closestItem = null;
      let closestDistance = Infinity;
      
      for (const item of otherItems) {
        let distance = 0;
        let isInDirection = false;
        
        switch (direction) {
          case 'left': // Negative X direction
            if (item.position.x < position.x - 0.1) {
              distance = position.x - item.position.x;
              isInDirection = Math.abs(item.position.z - position.z) < itemTolerance;
            }
            break;
          case 'right': // Positive X direction
            if (item.position.x > position.x + 0.1) {
              distance = item.position.x - position.x;
              isInDirection = Math.abs(item.position.z - position.z) < itemTolerance;
            }
            break;
          case 'up': // Negative Z direction (back)
            if (item.position.z < position.z - 0.1) {
              distance = position.z - item.position.z;
              isInDirection = Math.abs(item.position.x - position.x) < itemTolerance;
            }
            break;
          case 'down': // Positive Z direction (front)
            if (item.position.z > position.z + 0.1) {
              distance = item.position.z - position.z;
              isInDirection = Math.abs(item.position.x - position.x) < itemTolerance;
            }
            break;
        }
        
        if (isInDirection && distance < closestDistance) {
          closestDistance = distance;
          closestItem = item;
        }
      }
      
      return closestItem;
    };
    
    const leftItem = findClosestItemInDirection('left');
    const rightItem = findClosestItemInDirection('right');
    const upItem = findClosestItemInDirection('up');
    const downItem = findClosestItemInDirection('down');
    
    console.log('Closest items:', {
      left: leftItem ? `${leftItem.name} at X:${leftItem.position.x.toFixed(2)}` : 'none',
      right: rightItem ? `${rightItem.name} at X:${rightItem.position.x.toFixed(2)}` : 'none',
      up: upItem ? `${upItem.name} at Z:${upItem.position.z.toFixed(2)}` : 'none',
      down: downItem ? `${downItem.name} at Z:${downItem.position.z.toFixed(2)}` : 'none'
    });
    
    // Calculate available space in both directions
    let xAxisLeftBoundary = -halfKitchenWidth + 0.05;
    let xAxisRightBoundary = halfKitchenWidth - 0.05;
    let zAxisUpBoundary = -halfKitchenLength + 0.05;
    let zAxisDownBoundary = halfKitchenLength - 0.05;
    
    // Adjust boundaries based on found items
    if (leftItem) {
      xAxisLeftBoundary = leftItem.position.x + leftItem.dimensions.width / 2 + buffer;
    }
    if (rightItem) {
      xAxisRightBoundary = rightItem.position.x - rightItem.dimensions.width / 2 - buffer;
    }
    if (upItem) {
      zAxisUpBoundary = upItem.position.z + upItem.dimensions.depth / 2 + buffer;
    }
    if (downItem) {
      zAxisDownBoundary = downItem.position.z - downItem.dimensions.depth / 2 - buffer;
    }
    
    // Adjust for walls if cabinet is against them
    if (isAgainstLeftWall) {
      xAxisLeftBoundary = -halfKitchenWidth + 0.05;
    }
    if (isAgainstRightWall) {
      xAxisRightBoundary = halfKitchenWidth - 0.05;
    }
    if (isAgainstBackWall) {
      zAxisUpBoundary = -halfKitchenLength + 0.05;
    }
    if (isAgainstFrontWall) {
      zAxisDownBoundary = halfKitchenLength - 0.05;
    }
    
    const xAxisSpace = xAxisRightBoundary - xAxisLeftBoundary;
    const zAxisSpace = zAxisDownBoundary - zAxisUpBoundary;
    
    console.log('Available spaces:', {
      xAxis: `${xAxisSpace.toFixed(2)}m (${xAxisLeftBoundary.toFixed(2)} to ${xAxisRightBoundary.toFixed(2)})`,
      zAxis: `${zAxisSpace.toFixed(2)}m (${zAxisUpBoundary.toFixed(2)} to ${zAxisDownBoundary.toFixed(2)})`
    });
    
    // Choose the direction with more space, but prioritize based on context
    let finalWidth = 0.6;
    let chosenAxis = 'x';
    
    // If there are items on both sides in one axis, prefer that axis
    const hasItemsOnBothSidesX = leftItem && rightItem;
    const hasItemsOnBothSidesZ = upItem && downItem;
    
    if (hasItemsOnBothSidesX && !hasItemsOnBothSidesZ) {
      finalWidth = Math.max(0.3, Math.min(xAxisSpace, 4.0));
      chosenAxis = 'x';
    } else if (hasItemsOnBothSidesZ && !hasItemsOnBothSidesX) {
      finalWidth = Math.max(0.3, Math.min(zAxisSpace, 4.0));
      chosenAxis = 'z';
    } else {
      // Choose the axis with more available space
      if (xAxisSpace >= zAxisSpace && xAxisSpace > 0.6) {
        finalWidth = Math.max(0.3, Math.min(xAxisSpace, 4.0));
        chosenAxis = 'x';
      } else if (zAxisSpace > 0.6) {
        finalWidth = Math.max(0.3, Math.min(zAxisSpace, 4.0));
        chosenAxis = 'z';
      } else {
        // Both spaces are limited, choose the larger one
        if (xAxisSpace >= zAxisSpace) {
          finalWidth = Math.max(0.3, Math.min(xAxisSpace, 4.0));
          chosenAxis = 'x';
        } else {
          finalWidth = Math.max(0.3, Math.min(zAxisSpace, 4.0));
          chosenAxis = 'z';
        }
      }
    }
    
    console.log('Final decision:', {
      chosenAxis,
      finalWidth: finalWidth.toFixed(2),
      hasItemsOnBothSidesX,
      hasItemsOnBothSidesZ
    });
    
    return finalWidth;
  };

  const fillWidth = calculateFillWidth();

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
    
    // Place the cabinet first
    placeItem(cabinetId, position, rotation);
    
    // Then update the size if it's not the default
    if (newWidth !== 0.6) {
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
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">מלא את החלל</div>
              <div className="text-sm text-gray-600">
                {fillWidth > 0.6 
                  ? `ימלא ${fillWidth.toFixed(1)} מטר`
                  : fillWidth >= 0.3
                    ? `ימלא ${fillWidth.toFixed(1)} מטר (מינימום)`
                    : 'אין מספיק מקום למילוי'
                }
              </div>
              {fillWidth < 0.6 && fillWidth >= 0.3 && (
                <div className="text-xs text-yellow-600 mt-1">
                  ⚠️ מקום מוגבל - ארון קטן מהסטנדרט
                </div>
              )}
            </div>
            <Maximize2 className="text-gray-400" size={20} />
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