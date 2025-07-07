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
    const itemTolerance = 0.3; // 30cm tolerance for finding items on same wall/line
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
    
    let leftBoundary, rightBoundary;
    let workingAxis: 'x' | 'z';
    let cabinetPosition: number;
    
    // Determine working axis and boundaries
    if (isAgainstLeftWall || isAgainstRightWall) {
      // Working along Z axis (length of kitchen)
      workingAxis = 'z';
      cabinetPosition = position.z;
      leftBoundary = -halfKitchenLength + 0.05; // Kitchen boundary + small margin
      rightBoundary = halfKitchenLength - 0.05;
      
      // Find items that are on the same wall (similar X position)
      const sameWallItems = otherItems.filter(item => {
        const wallDistance = isAgainstLeftWall 
          ? Math.abs(item.position.x + halfKitchenWidth)
          : Math.abs(item.position.x - halfKitchenWidth);
        return wallDistance < itemTolerance;
      });
      
      console.log('Same wall items (Z axis):', sameWallItems.map(item => ({
        name: item.name,
        z: item.position.z,
        halfDepth: item.dimensions.depth / 2
      })));
      
      // Find closest items on left and right
      const itemsOnLeft = sameWallItems.filter(item => 
        item.position.z < cabinetPosition - 0.05
      );
      const itemsOnRight = sameWallItems.filter(item => 
        item.position.z > cabinetPosition + 0.05
      );
      
      if (itemsOnLeft.length > 0) {
        const closestLeft = itemsOnLeft.reduce((closest, item) => 
          item.position.z > closest.position.z ? item : closest
        );
        leftBoundary = closestLeft.position.z + closestLeft.dimensions.depth / 2 + buffer;
      }
      
      if (itemsOnRight.length > 0) {
        const closestRight = itemsOnRight.reduce((closest, item) => 
          item.position.z < closest.position.z ? item : closest
        );
        rightBoundary = closestRight.position.z - closestRight.dimensions.depth / 2 - buffer;
      }
      
    } else if (isAgainstBackWall || isAgainstFrontWall) {
      // Working along X axis (width of kitchen)
      workingAxis = 'x';
      cabinetPosition = position.x;
      leftBoundary = -halfKitchenWidth + 0.05;
      rightBoundary = halfKitchenWidth - 0.05;
      
      // Find items that are on the same wall (similar Z position)
      const sameWallItems = otherItems.filter(item => {
        const wallDistance = isAgainstBackWall 
          ? Math.abs(item.position.z + halfKitchenLength)
          : Math.abs(item.position.z - halfKitchenLength);
        return wallDistance < itemTolerance;
      });
      
      console.log('Same wall items (X axis):', sameWallItems.map(item => ({
        name: item.name,
        x: item.position.x,
        halfWidth: item.dimensions.width / 2
      })));
      
      // Find closest items on left and right
      const itemsOnLeft = sameWallItems.filter(item => 
        item.position.x < cabinetPosition - 0.05
      );
      const itemsOnRight = sameWallItems.filter(item => 
        item.position.x > cabinetPosition + 0.05
      );
      
      if (itemsOnLeft.length > 0) {
        const closestLeft = itemsOnLeft.reduce((closest, item) => 
          item.position.x > closest.position.x ? item : closest
        );
        leftBoundary = closestLeft.position.x + closestLeft.dimensions.width / 2 + buffer;
      }
      
      if (itemsOnRight.length > 0) {
        const closestRight = itemsOnRight.reduce((closest, item) => 
          item.position.x < closest.position.x ? item : closest
        );
        rightBoundary = closestRight.position.x - closestRight.dimensions.width / 2 - buffer;
      }
      
    } else {
      // Not against any wall - look for items in line
      console.log('Not against wall, looking for items in line...');
      
      // Check if there are items roughly in line horizontally (same Z)
      const itemsInLineHorizontal = otherItems.filter(item => 
        Math.abs(item.position.z - position.z) < itemTolerance
      );
      
      // Check if there are items roughly in line vertically (same X)
      const itemsInLineVertical = otherItems.filter(item => 
        Math.abs(item.position.x - position.x) < itemTolerance
      );
      
      console.log('Items in line horizontal:', itemsInLineHorizontal.length);
      console.log('Items in line vertical:', itemsInLineVertical.length);
      
      if (itemsInLineHorizontal.length >= itemsInLineVertical.length && itemsInLineHorizontal.length > 0) {
        // Work along X axis
        workingAxis = 'x';
        cabinetPosition = position.x;
        leftBoundary = -halfKitchenWidth + 0.05;
        rightBoundary = halfKitchenWidth - 0.05;
        
        const itemsOnLeft = itemsInLineHorizontal.filter(item => 
          item.position.x < cabinetPosition - 0.05
        );
        const itemsOnRight = itemsInLineHorizontal.filter(item => 
          item.position.x > cabinetPosition + 0.05
        );
        
        if (itemsOnLeft.length > 0) {
          const closestLeft = itemsOnLeft.reduce((closest, item) => 
            item.position.x > closest.position.x ? item : closest
          );
          leftBoundary = closestLeft.position.x + closestLeft.dimensions.width / 2 + buffer;
        }
        
        if (itemsOnRight.length > 0) {
          const closestRight = itemsOnRight.reduce((closest, item) => 
            item.position.x < closest.position.x ? item : closest
          );
          rightBoundary = closestRight.position.x - closestRight.dimensions.width / 2 - buffer;
        }
        
      } else if (itemsInLineVertical.length > 0) {
        // Work along Z axis
        workingAxis = 'z';
        cabinetPosition = position.z;
        leftBoundary = -halfKitchenLength + 0.05;
        rightBoundary = halfKitchenLength - 0.05;
        
        const itemsOnLeft = itemsInLineVertical.filter(item => 
          item.position.z < cabinetPosition - 0.05
        );
        const itemsOnRight = itemsInLineVertical.filter(item => 
          item.position.z > cabinetPosition + 0.05
        );
        
        if (itemsOnLeft.length > 0) {
          const closestLeft = itemsOnLeft.reduce((closest, item) => 
            item.position.z > closest.position.z ? item : closest
          );
          leftBoundary = closestLeft.position.z + closestLeft.dimensions.depth / 2 + buffer;
        }
        
        if (itemsOnRight.length > 0) {
          const closestRight = itemsOnRight.reduce((closest, item) => 
            item.position.z < closest.position.z ? item : closest
          );
          rightBoundary = closestRight.position.z - closestRight.dimensions.depth / 2 - buffer;
        }
        
      } else {
        console.log('No items in line, returning default size');
        return 0.6; // No items in line, keep default
      }
    }
    
    const availableSpace = rightBoundary - leftBoundary;
    const finalWidth = Math.max(0.3, Math.min(availableSpace, 4.0));
    
    console.log('Final calculation:', {
      workingAxis,
      cabinetPosition,
      leftBoundary,
      rightBoundary,
      availableSpace,
      finalWidth
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