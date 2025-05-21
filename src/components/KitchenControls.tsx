import React from 'react';
import { MoveHorizontal } from 'lucide-react';
import { useKitchen, KitchenItemType } from '../store/KitchenContext';

const KitchenControls: React.FC = () => {
  const { 
    availableItems, 
    setSelectedItem, 
    placedItems,
    removeItem
  } = useKitchen();

  const handleSelectItem = (itemId: string) => {
    const item = availableItems.find(item => item.id === itemId);
    if (item) {
      setSelectedItem(item);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4 text-primary-dark">רכיבי מטבח</h2>
      
      {availableItems.length === 0 && (
        <p className="text-gray-500 mb-4">כל הרכיבים מוקמו במטבח</p>
      )}
      
      <div className="space-y-3">
        {availableItems.map(item => (
          <div 
            key={item.id}
            className="kitchen-item flex items-center justify-between"
            onClick={() => handleSelectItem(item.id)}
          >
            <span className="text-2xl">{getItemIcon(item.type)}</span>
            <span className="font-medium">{item.name}</span>
            <MoveHorizontal className="text-gray-400" size={18} />
          </div>
        ))}
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