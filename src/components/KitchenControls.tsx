import React, { useState } from 'react';
import { MoveHorizontal, AlertCircle, Eye, RotateCcw, Package } from 'lucide-react';
import { useKitchen, KitchenItemType } from '../store/KitchenContext';

const KitchenControls: React.FC = () => {
  const { 
    availableItems, 
    setSelectedItem, 
    placedItems,
    removeItem,
    selectedItem
  } = useKitchen();

  const [previewItem, setPreviewItem] = useState<string | null>(null);

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
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Package className="text-white" size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">רכיבי מטבח</h2>
      </div>
      
      {Object.keys(groupedItems).length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-white" size={24} />
          </div>
          <p className="text-gray-600 font-medium">כל הרכיבים מוקמו במטבח!</p>
          <p className="text-gray-500 text-sm mt-1">מעולה! המטבח שלך מוכן</p>
        </div>
      )}
      
      <div className="space-y-3">
        {Object.values(groupedItems).map(group => {
          const isCountertopLimitReached = group.type === KitchenItemType.COUNTERTOP && placedCabinets >= 10;
          const isSelected = selectedItem?.type === group.type;
          
          return (
            <div 
              key={group.type}
              className={`group relative border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
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
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getItemColor(group.type)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                    {getItemIcon(group.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        group.count > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {group.count} יחידות
                      </span>
                      {isCountertopLimitReached && (
                        <AlertCircle size={14} className="text-warning" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {group.count > 0 && !isCountertopLimitReached && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewItem(previewItem === group.type ? null : group.type);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="תצוגה מקדימה"
                      >
                        <Eye size={16} />
                      </button>
                      <MoveHorizontal 
                        className={`text-gray-400 transition-colors ${
                          isSelected ? 'text-primary' : 'group-hover:text-gray-600'
                        }`} 
                        size={18} 
                      />
                    </>
                  )}
                </div>
              </div>
              
              {/* Dimensions */}
              <div className="mt-3 text-xs text-gray-500">
                {group.dimensions.width} × {group.dimensions.depth} × {group.dimensions.height} מטר
              </div>
              
              {isSelected && (
                <div className="absolute inset-0 border-2 border-primary rounded-xl bg-primary/5 flex items-center justify-center">
                  <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    נבחר - גרור למטבח
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {placedItems.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            רכיבים במטבח ({placedItems.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {placedItems.map(item => (
              <div 
                key={item.id}
                className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${getItemColor(item.type)} rounded-lg flex items-center justify-center text-white text-sm`}>
                    {getItemIcon(item.type)}
                  </div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <button 
                  className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors font-medium"
                  onClick={() => removeItem(item.id)}
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