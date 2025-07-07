import React, { useState } from 'react';
import { MoveHorizontal, AlertCircle, Eye, Package, Plus, Ruler } from 'lucide-react';
import { useKitchen, KitchenItemType } from '../store/KitchenContext';

const KitchenControls: React.FC = () => {
  const { 
    availableItems, 
    setSelectedItem, 
    placedItems,
    removeItem,
    selectedItem,
    createCustomCabinet
  } = useKitchen();

  const [previewItem, setPreviewItem] = useState<string | null>(null);
  const [showCustomCabinet, setShowCustomCabinet] = useState(false);
  const [customWidth, setCustomWidth] = useState('0.6');

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

  const handleCreateCustomCabinet = () => {
    const width = parseFloat(customWidth);
    if (width >= 0.3 && width <= 3.0) {
      const customCabinet = createCustomCabinet(width);
      setSelectedItem(customCabinet);
      setShowCustomCabinet(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Package className="text-white" size={16} />
        </div>
        <h2 className="text-base font-bold text-gray-900">רכיבי מטבח</h2>
      </div>
      
      {/* Custom Cabinet Creator */}
      <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Ruler className="text-green-600" size={14} />
          <span className="font-medium text-green-800 text-sm">ארון בגודל מותאם</span>
        </div>
        
        {!showCustomCabinet ? (
          <button
            onClick={() => setShowCustomCabinet(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Plus size={14} />
            צור ארון בגודל מותאם
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                step="0.1"
                min="0.3"
                max="3.0"
                placeholder="רוחב במטר"
                className="flex-1 px-2 py-1 text-sm border border-green-300 rounded-lg focus:border-green-500 focus:ring-0"
              />
              <button
                onClick={handleCreateCustomCabinet}
                disabled={!customWidth || parseFloat(customWidth) < 0.3 || parseFloat(customWidth) > 3.0}
                className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                צור
              </button>
            </div>
            <button
              onClick={() => setShowCustomCabinet(false)}
              className="w-full px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              ביטול
            </button>
          </div>
        )}
        
        <p className="text-xs text-green-600 mt-1">
          💡 יוצר ארון בגודל מדויק למילוי רווחים
        </p>
      </div>
      
      {Object.keys(groupedItems).length === 0 && (
        <div className="text-center py-6 flex-1 flex flex-col justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="text-white" size={20} />
          </div>
          <p className="text-gray-600 font-medium text-sm">כל הרכיבים מוקמו במטבח!</p>
          <p className="text-gray-500 text-xs mt-1">מעולה! המטבח שלך מוכן</p>
        </div>
      )}
      
      <div className="space-y-2 flex-1 overflow-y-auto">
        {Object.values(groupedItems).map(group => {
          const isCountertopLimitReached = group.type === KitchenItemType.COUNTERTOP && placedCabinets >= 10;
          const isSelected = selectedItem?.type === group.type;
          
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
              onClick={() => group.count > 0 && !isCountertopLimitReached && handleSelectItem(group.type)}
              title={isCountertopLimitReached ? 'הגעת למגבלת הארונות המותרת (10)' : group.count === 0 ? 'אין יחידות נותרות' : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getItemColor(group.type)} rounded-lg flex items-center justify-center text-white text-lg shadow-lg`}>
                    {getItemIcon(group.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
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
              💡 לא במקום הנכון? לחץ "הסר" ולאחר מכן גרור שוב
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
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 text-xs">{item.name}</span>
                    {item.customWidth && item.customWidth !== 0.6 && (
                      <div className="text-xs text-gray-500">({item.customWidth}מ' רוחב)</div>
                    )}
                  </div>
                </div>
                <button 
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors font-medium"
                  onClick={() => removeItem(item.id)}
                  title="הסר רכיב כדי למקם אותו במקום אחר"
                >
                  הסר
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenControls;