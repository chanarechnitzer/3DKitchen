import React, { useState } from 'react';
import { MoveHorizontal, AlertCircle, Eye, Package } from 'lucide-react';
import { useKitchen, KitchenItemType } from '../store/KitchenContext';
import CabinetOptionsDialog from './CabinetOptionsDialog';
import OvenStackDialog from './OvenStackDialog';

const KitchenControls: React.FC = () => {
  const { 
    availableItems, 
    setSelectedItem, 
    placedItems,
    removeItem,
    selectedItem,
    updateCabinetSize,
    updateOvenStack,
    kitchenDimensions
  } = useKitchen();

  const [previewItem, setPreviewItem] = useState<string | null>(null);
  const [showCabinetDialog, setShowCabinetDialog] = useState(false);
  const [showOvenDialog, setShowOvenDialog] = useState(false);
  const [selectedCabinetId, setSelectedCabinetId] = useState<string | null>(null);
  const [baseOvenForStack, setBaseOvenForStack] = useState<string | null>(null);

  // Group items by type
  const groupedItems = availableItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = {
        name: item.name,
        type: item.type,
        count: 0,
        dimensions: item.dimensions,
        items: []
      };
    }
    acc[item.type].count++;
    acc[item.type].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; type: KitchenItemType; count: number; dimensions: any; items: typeof availableItems }>);

  const handleSelectItem = (type: KitchenItemType) => {
    if (type === KitchenItemType.COUNTERTOP) {
      const placedCabinets = placedItems.filter(item => item.type === KitchenItemType.COUNTERTOP).length;
      if (placedCabinets >= 10) {
        return;
      }
    }
    
    if (groupedItems[type]?.items.length > 0) {
      setSelectedItem(groupedItems[type].items[0]);
    }
  };

  const getItemIcon = (type: KitchenItemType) => {
    switch (type) {
      case KitchenItemType.SINK:
        return '💧';
      case KitchenItemType.STOVE:
        return '🔥';
      case KitchenItemType.OVEN:
        return '♨️';
      case KitchenItemType.REFRIGERATOR:
        return '❄️';
      case KitchenItemType.COUNTERTOP:
        return '📦';
      default:
        return '📄';
    }
  };

  const getItemColor = (type: KitchenItemType) => {
    switch (type) {
      case KitchenItemType.SINK:
        return 'from-blue-400 to-blue-600';
      case KitchenItemType.STOVE:
        return 'from-red-400 to-red-600';
      case KitchenItemType.OVEN:
        return 'from-orange-400 to-orange-600';
      case KitchenItemType.REFRIGERATOR:
        return 'from-cyan-400 to-cyan-600';
      case KitchenItemType.COUNTERTOP:
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const placedCabinets = placedItems.filter(item => item.type === KitchenItemType.COUNTERTOP).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Package className="text-white" size={16} />
        </div>
        <h2 className="text-base font-bold text-gray-900">רכיבי מטבח</h2>
      </div>
      
      {/* Show item options when item is selected */}
      {selectedItem && (
        <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-yellow-500/10 rounded-xl border-2 border-primary/30 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">
                {getItemIcon(selectedItem.type)}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{selectedItem.name}</h3>
              <p className="text-sm text-primary font-medium">✨ מוכן להנחה במטבח</p>
            </div>
          </div>
          
          <div className="text-center mb-3">
            <div className="text-3xl mb-2 animate-pulse">🎯</div>
            <p className="text-sm font-bold text-gray-900 mb-3">גרור למיקום במטבח</p>
            <div className="bg-white/80 rounded-lg p-3 space-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>הפריט יצמד אוטומטית לקירות ולפריטים אחרים</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>בפינות לחץ R או לחץ על כפתור הסיבוב</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>לחץ במטבח כדי למקם את הפריט</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedItem(null)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ביטול
            </button>
            {selectedItem.type === KitchenItemType.COUNTERTOP && (
              <button
                onClick={() => {
                  setShowCabinetDialog(true);
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                🔧 אפשרויות
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Cabinet Options Dialog */}
      {showCabinetDialog && selectedItem && (
        <CabinetOptionsDialog
          onClose={() => setShowCabinetDialog(false)}
          onConfirm={(option, customWidth) => {
            let finalWidth = selectedItem.dimensions.width;
            
            console.log('🎯 Cabinet option selected:', option);
            console.log('📏 Current width:', finalWidth);
            
            if (option === 'custom' && customWidth) {
              finalWidth = customWidth;
              console.log('🔧 Using custom width:', finalWidth);
            } else if (option === 'fill' && customWidth) {
              finalWidth = customWidth;
              console.log('📐 Using fill width:', finalWidth);
            }
            
            console.log('✅ Final width to apply:', finalWidth);
            
            if (finalWidth !== selectedItem.dimensions.width) {
              const updatedItem = {
                ...selectedItem,
                dimensions: {
                  ...selectedItem.dimensions,
                  width: finalWidth
                }
              };
              setSelectedItem(updatedItem);
              console.log('🔄 Updated selected item with new width');
            }
            setShowCabinetDialog(false);
          }}
          defaultWidth={selectedItem.dimensions.width}
          placedItems={placedItems}
          position={undefined} // For new items, position will be determined during placement
          kitchenDimensions={kitchenDimensions}
        />
      )}
      
      {/* Oven Stack Dialog */}
      {showOvenDialog && baseOvenForStack && (
        <OvenStackDialog
          onClose={() => {
            setShowOvenDialog(false);
            setBaseOvenForStack(null);
          }}
          onConfirm={(shouldStack) => {
            if (shouldStack && selectedItem) {
              // Create oven stack
              updateOvenStack(baseOvenForStack, selectedItem.id);
            } else {
              // Replace existing oven
              removeItem(baseOvenForStack);
            }
            setShowOvenDialog(false);
            setBaseOvenForStack(null);
          }}
          baseOvenName={placedItems.find(item => item.id === baseOvenForStack)?.name || 'תנור'}
        />
      )}
      
      {Object.keys(groupedItems).length === 0 && (
        <div className="text-center py-6 flex-1 flex flex-col justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="text-white" size={20} />
          </div>
          <p className="text-gray-600 font-medium text-sm">כל הרכיבים מוקמו במטבח!</p>
          <p className="text-gray-500 text-xs mt-1">מעולה! המטבח שלך מוכן</p>
        </div>
      )}
      
      <div className={`space-y-2 flex-1 overflow-y-auto ${selectedItem ? 'opacity-30 pointer-events-none' : ''}`}>
        {Object.values(groupedItems).map(group => {
          const isCountertopLimitReached = group.type === KitchenItemType.COUNTERTOP && placedCabinets >= 10;
          const isSelected = selectedItem?.type === group.type;
          const isDisabled = selectedItem !== null && selectedItem.type !== group.type;
          
          return (
            <div 
              key={group.type}
              className={`group relative border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : (group.count === 0 || isCountertopLimitReached) 
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => group.count > 0 && !isCountertopLimitReached && !isDisabled && handleSelectItem(group.type)}
              title={
                isCountertopLimitReached ? 'הגעת למגבלת הארונות המותרת (10)' : 
                group.count === 0 ? 'אין יחידות נותרות' : undefined
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getItemColor(group.type)} rounded-lg flex items-center justify-center text-white text-lg shadow-lg`}>
                    {getItemIcon(group.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        group.count > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {group.count} יחידות
                      </span>
                      {isCountertopLimitReached && (
                        <AlertCircle size={12} className="text-warning" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {group.count > 0 && !isCountertopLimitReached && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewItem(previewItem === group.type ? null : group.type);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="תצוגה מקדימה"
                      >
                        <Eye size={14} />
                      </button>
                      <MoveHorizontal 
                        className={`text-gray-400 transition-colors ${
                          isSelected ? 'text-primary' : 'group-hover:text-gray-600'
                        }`} 
                        size={16} 
                      />
                    </>
                  )}
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute inset-0 border-2 border-primary rounded-lg bg-primary/5 flex items-center justify-center">
                  <div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                    נבחר - גרור למטבח
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {placedItems.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            רכיבים במטבח ({placedItems.length})
          </h3>
          
          <div className="mb-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 font-medium text-center">
              💡 לחץ על "אפשרויות" לשינוי גודל או "הסר" להזזה
            </p>
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {placedItems.map(item => (
              <div 
                key={item.id}
                className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 bg-gradient-to-br ${getItemColor(item.type)} rounded-lg flex items-center justify-center text-white text-xs`}>
                    {getItemIcon(item.type)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 text-xs">{item.name}</span>
                    {item.type === 'countertop' && (
                      <div className="text-xs text-gray-500">
                        {(item.dimensions.width * 100).toFixed(0)} ס"מ רוחב
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {item.type === 'countertop' && (
                    <button 
                      className="text-xs text-primary hover:text-primary-dark hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors font-medium"
                      onClick={() => {
                        setSelectedCabinetId(item.id);
                        setShowCabinetDialog(true);
                      }}
                      title="שנה גודל ארון"
                    >
                      🔧
                    </button>
                  )}
                  <button 
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors font-medium"
                    onClick={() => removeItem(item.id)}
                    title="הסר רכיב כדי למקם אותו במקום אחר"
                  >
                    הסר
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Cabinet Options Dialog for placed items */}
      {showCabinetDialog && selectedCabinetId && !selectedItem && (
        <CabinetOptionsDialog
          onClose={() => {
            setShowCabinetDialog(false);
            setSelectedCabinetId(null);
          }}
          onConfirm={(option, customWidth, fillPosition) => {
            if (selectedCabinetId) {
              const currentItem = placedItems.find(item => item.id === selectedCabinetId);
              console.log('🎯 Updating placed cabinet:', currentItem?.name);
              console.log('📏 Current item width:', currentItem?.dimensions.width);
              console.log('🔧 Selected option:', option);
              console.log('📐 Custom width received:', customWidth);
              console.log('📍 Fill position received:', fillPosition);
              
              let finalWidth = currentItem?.dimensions.width || 0.6;
              
              if (option === 'custom' && customWidth) {
                finalWidth = customWidth;
                console.log('🔧 Using custom width:', finalWidth);
              } else if (option === 'fill' && customWidth) {
                finalWidth = customWidth;
                console.log('📐 Using fill width:', finalWidth);
                
                // ✅ CRITICAL: For fill option, also update position
                if (fillPosition && currentItem) {
                  console.log('📍 Updating position for fill option');
                  updateCabinetSizeAndPosition(selectedCabinetId, finalWidth, fillPosition);
                  setShowCabinetDialog(false);
                  setSelectedCabinetId(null);
                  return;
                }
              } else if (option === 'keep') {
                console.log('✋ Keeping current width:', finalWidth);
              }
              
              console.log('✅ Final width to apply:', finalWidth);
              console.log('🔄 Calling updateCabinetSize with:', selectedCabinetId, finalWidth);
              updateCabinetSize(selectedCabinetId, finalWidth);
            }
            setShowCabinetDialog(false);
            setSelectedCabinetId(null);
          }}
          defaultWidth={placedItems.find(item => item.id === selectedCabinetId)?.dimensions.width || 0.6}
          placedItems={placedItems}
          position={placedItems.find(item => item.id === selectedCabinetId)?.position ? {
            x: placedItems.find(item => item.id === selectedCabinetId)!.position.x,
            z: placedItems.find(item => item.id === selectedCabinetId)!.position.z
          } : undefined}
          kitchenDimensions={kitchenDimensions}
        />
      )}
    </div>
  );
};

export default KitchenControls;