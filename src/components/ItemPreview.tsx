import React, { useState } from 'react';
import { RotateCcw, Eye, Move3D } from 'lucide-react';
import { KitchenItem } from '../store/KitchenContext';

interface ItemPreviewProps {
  item: KitchenItem;
  onClose: () => void;
}

const ItemPreview: React.FC<ItemPreviewProps> = ({ item, onClose }) => {
  const [viewMode, setViewMode] = useState<'top' | '3d'>('top');
  const [rotation, setRotation] = useState(0);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'sink': return '💧';
      case 'stove': return '🔥';
      case 'oven': return '♨️';
      case 'refrigerator': return '❄️';
      case 'countertop': return '📦';
      default: return '📄';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'sink': return 'from-blue-400 to-blue-600';
      case 'stove': return 'from-red-400 to-red-600';
      case 'oven': return 'from-orange-400 to-orange-600';
      case 'refrigerator': return 'from-cyan-400 to-cyan-600';
      case 'countertop': return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-80 z-40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${getItemColor(item.type)} rounded-xl flex items-center justify-center text-white text-lg`}>
            {getItemIcon(item.type)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">
              {item.dimensions.width} × {item.dimensions.depth} × {item.dimensions.height}מ'
            </p>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 relative overflow-hidden">
        <div className="flex items-center justify-center h-32">
          {viewMode === 'top' ? (
            <div 
              className={`bg-gradient-to-br ${getItemColor(item.type)} rounded-lg shadow-lg transform transition-transform duration-300`}
              style={{
                width: `${Math.min(item.dimensions.width * 40, 80)}px`,
                height: `${Math.min(item.dimensions.depth * 40, 80)}px`,
                transform: `rotate(${rotation}deg)`,
              }}
            />
          ) : (
            <div 
              className={`bg-gradient-to-br ${getItemColor(item.type)} rounded-lg shadow-lg transform transition-transform duration-300`}
              style={{
                width: `${Math.min(item.dimensions.width * 30, 60)}px`,
                height: `${Math.min(item.dimensions.height * 20, 80)}px`,
                transform: `rotateY(${rotation}deg) rotateX(10deg)`,
                transformStyle: 'preserve-3d',
              }}
            />
          )}
        </div>
        
        {/* View Controls */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => setViewMode(viewMode === 'top' ? '3d' : 'top')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === '3d' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            title={viewMode === 'top' ? 'מבט תלת ממדי' : 'מבט עליון'}
          >
            {viewMode === 'top' ? <Move3D size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={() => setRotation(rotation + 45)}
            className="p-2 bg-white text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="סובב"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-primary/10 to-yellow-500/10 rounded-xl p-4 border border-primary/20">
        <p className="text-sm text-gray-700 text-center">
          <strong>גרור</strong> את הפריט למקום הרצוי במטבח
          <br />
          הפריט יצמד אוטומטית לקירות
        </p>
      </div>
    </div>
  );
};

export default ItemPreview;