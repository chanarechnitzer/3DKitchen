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
    const tolerance = 0.15; // 15cm tolerance for wall detection
    const halfKitchenWidth = kitchenDimensions.width / 2;
    const halfKitchenLength = kitchenDimensions.length / 2;
    
    // Determine which wall the cabinet is against
    const distanceToLeftWall = Math.abs(position.x + halfKitchenWidth);
    const distanceToRightWall = Math.abs(position.x - halfKitchenWidth);
    const distanceToBackWall = Math.abs(position.z + halfKitchenLength);
    const distanceToFrontWall = Math.abs(position.z - halfKitchenLength);
    
    const isAgainstLeftWall = distanceToLeftWall < tolerance;
    const isAgainstRightWall = distanceToRightWall < tolerance;
    const isAgainstBackWall = distanceToBackWall < tolerance;
    const isAgainstFrontWall = distanceToFrontWall < tolerance;
    
    console.log('Cabinet position:', position);
    console.log('Kitchen dimensions:', kitchenDimensions);
    console.log('Wall distances:', {
      left: distanceToLeftWall,
      right: distanceToRightWall,
      back: distanceToBackWall,
      front: distanceToFrontWall
    });
    console.log('Against walls:', {
      left: isAgainstLeftWall,
      right: isAgainstRightWall,
      back: isAgainstBackWall,
      front: isAgainstFrontWall
    });
    
    if (!isAgainstLeftWall && !isAgainstRightWall && !isAgainstBackWall && !isAgainstFrontWall) {
      console.log('Not against any wall, returning default size');
      return 0.6; // Not against a wall, keep default size
    }
    
    // Find other items on the same wall with more generous tolerance
    const wallTolerance = 0.2; // 20cm tolerance for finding items on same wall
    const sameWallItems = placedItems.filter(item => {
      if (item.id === cabinetId) return false; // Exclude self
      
      if (isAgainstLeftWall && Math.abs(item.position.x + halfKitchenWidth) < wallTolerance) return true;
      if (isAgainstRightWall && Math.abs(item.position.x - halfKitchenWidth) < wallTolerance) return true;
      if (isAgainstBackWall && Math.abs(item.position.z + halfKitchenLength) < wallTolerance) return true;
      if (isAgainstFrontWall && Math.abs(item.position.z - halfKitchenLength) < wallTolerance) return true;
      
      return false;
    });
    
    console.log('Same wall items:', sameWallItems.map(item => ({
      name: item.name,
      position: item.position,
      dimensions: item.dimensions
    })));
    
    if (sameWallItems.length === 0) {
      // No other items on the same wall, fill the entire wall
      console.log('No items on same wall, filling entire wall');
      if (isAgainstLeftWall || isAgainstRightWall) {
        return kitchenDimensions.length - 0.2; // Leave 10cm margin on each side
      } else {
        return kitchenDimensions.width - 0.2;
      }
    }
    
    // Find the closest items on each side
    let leftBoundary, rightBoundary;
    
    if (isAgainstLeftWall || isAgainstRightWall) {
      // Working along the Z axis
      const itemsOnLeft = sameWallItems.filter(item => item.position.z < position.z - 0.1);
      const itemsOnRight = sameWallItems.filter(item => item.position.z > position.z + 0.1);
      
      leftBoundary = itemsOnLeft.length > 0 
        ? Math.max(...itemsOnLeft.map(item => item.position.z + item.dimensions.depth / 2))
        : -halfKitchenLength + 0.1;
        
      rightBoundary = itemsOnRight.length > 0
        ? Math.min(...itemsOnRight.map(item => item.position.z - item.dimensions.depth / 2))
        : halfKitchenLength - 0.1;
    } else {
      // Working along the X axis
      const itemsOnLeft = sameWallItems.filter(item => item.position.x < position.x - 0.1);
      const itemsOnRight = sameWallItems.filter(item => item.position.x > position.x + 0.1);
      
      leftBoundary = itemsOnLeft.length > 0
        ? Math.max(...itemsOnLeft.map(item => item.position.x + item.dimensions.width / 2))
        : -halfKitchenWidth + 0.1;
        
      rightBoundary = itemsOnRight.length > 0
        ? Math.min(...itemsOnRight.map(item => item.position.x - item.dimensions.width / 2))
        : halfKitchenWidth - 0.1;
    }
    
    const availableSpace = rightBoundary - leftBoundary;
    
    console.log('Boundary calculation:', {
      leftBoundary,
      rightBoundary,
      availableSpace,
      finalWidth: Math.max(0.3, Math.min(availableSpace - 0.05, 4.0))
    });
    
    return Math.max(0.3, Math.min(availableSpace - 0.05, 4.0)); // Min 30cm, max 4m, with 5cm buffer
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