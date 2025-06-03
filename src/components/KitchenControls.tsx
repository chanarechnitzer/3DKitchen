import React from 'react';
import { MoveHorizontal, AlertCircle } from 'lucide-react';
import { useKitchen, KitchenItemType } from '../store/KitchenContext';

const KitchenControls: React.FC = () => {
  const { 
    availableItems, 
    setSelectedItem, 
    placedItems,
    removeItem
  } = useKitchen();

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
        return; // Don't allow selection if limit reached
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

  const placedCabinets = placedItems.filter(item => item.type === KitchenItemType.COUNTERTOP).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4 text-primary-dark">רכיבי מטבח</h2>
      
      {Object.keys(groupedItems).length === 0 && (
        <p className="text-gray-500 mb-4">כל הרכיבים מוקמו במטבח</p>
      )}
      
      <div className="space-y-3">
        {Object.values(groupedItems).map(group => {
          const isCountertopLimitReached = group.type === KitchenItemType.COUNTERTOP && placedCabinets >= 10;
          
          return (
            <div 
              key={group.type}
              className={`kitchen-item flex items-center justify-between ${
                (group.count === 0 || isCountertopLimitReached) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => group.count > 0 && !isCountertopLimitReached && handleSelectItem(group.type)}
              title={isCountertopLimitReached ? 'הגעת למגבלת הארונות המותרת (10)' : group.count === 0 ? 'אין יחידות נותרות' : undefined}
            >
              <span className="text-2xl">{getItemIcon(group.type)}</span>
              <div className="flex flex-col items-end">
                <span className="font-medium">{group.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">
                    {group.count} יחידות נותרו
                  </span>
                  {isCountertopLimitReached && (
                    <AlertCircle size={14} className="text-warning" />
                  )}
                </div>
              </div>
              <MoveHorizontal 
                className={`text-gray-400 ${(group.count === 0 || isCountertopLimitReached) ? 'opacity-50' : ''}`} 
                size={18} 
              />
            </div>
          );
        })}
      </div>
      
      {placedItems.length > 0 && (
        <>
          <h3 className="text-lg font-bold mt-6 mb-3 text-secondary-dark">רכיבים במטבח</h3>
          <div className="space-y-2">
            {placedItems.map(item => (
              <div 
                key={item.id}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="text-xl">{getItemIcon(item.type)}</span>
                <span>{item.name}</span>
                <button 
                  className="text-sm text-danger hover:underline"
                  onClick={() => removeItem(item.id)}
                >
                  הסר
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default KitchenControls;