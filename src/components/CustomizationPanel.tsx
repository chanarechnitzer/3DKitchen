import React, { useState } from 'react';
import { ArrowLeft, Palette, Sparkles, Play, Eye } from 'lucide-react';
import { useKitchen } from '../store/KitchenContext';

interface CustomizationPanelProps {
  onStartDesigning: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ onStartDesigning }) => {
  const { customization, updateCustomization } = useKitchen();
  const [selectedCategory, setSelectedCategory] = useState<'cabinets' | 'countertops' | 'walls' | 'floors'>('cabinets');

  const categories = [
    { id: 'cabinets', name: 'ארונות', icon: '🗄️' },
    { id: 'countertops', name: 'משטחים', icon: '🪨' },
    { id: 'walls', name: 'קירות', icon: '🎨' },
    { id: 'floors', name: 'רצפות', icon: '🏠' },
  ];

  const finishOptions = {
    cabinets: [
      { id: 'white', name: 'לבן קלאסי', color: '#ffffff', preview: 'bg-white border-2 border-gray-200' },
      { id: 'wood', name: 'עץ טבעי', color: '#8B4513', preview: 'bg-amber-700' },
      { id: 'gray', name: 'אפור מודרני', color: '#6B7280', preview: 'bg-gray-500' },
      { id: 'navy', name: 'כחול כהה', color: '#1E3A8A', preview: 'bg-blue-800' },
    ],
    countertops: [
      { id: 'granite', name: 'גרניט', color: '#2D3748', preview: 'bg-gradient-to-br from-gray-700 to-gray-900' },
      { id: 'marble', name: 'שיש', color: '#F7FAFC', preview: 'bg-gradient-to-br from-gray-100 to-white' },
      { id: 'quartz', name: 'קוורץ', color: '#4A5568', preview: 'bg-gradient-to-br from-gray-600 to-gray-800' },
      { id: 'wood', name: 'עץ', color: '#8B4513', preview: 'bg-gradient-to-br from-amber-600 to-amber-800' },
    ],
    walls: [
      { id: 'light', name: 'בהיר', color: '#F8FAFC', preview: 'bg-slate-50' },
      { id: 'warm', name: 'חם', color: '#FEF3E2', preview: 'bg-orange-50' },
      { id: 'cool', name: 'קריר', color: '#EFF6FF', preview: 'bg-blue-50' },
      { id: 'bold', name: 'נועז', color: '#1E293B', preview: 'bg-slate-800' },
    ],
    floors: [
      { id: 'wood', name: 'פרקט', color: '#8B4513', preview: 'bg-gradient-to-r from-amber-700 to-amber-800' },
      { id: 'tile', name: 'אריחים', color: '#E2E8F0', preview: 'bg-slate-200' },
      { id: 'stone', name: 'אבן', color: '#64748B', preview: 'bg-slate-500' },
      { id: 'concrete', name: 'בטון', color: '#374151', preview: 'bg-gray-700' },
    ],
  };

  const handleFinishChange = (category: keyof typeof customization, finishId: string) => {
    updateCustomization(category, finishId);
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 h-16 flex-shrink-0">
        <div className="container mx-auto px-6 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-3">
              <Palette className="text-purple-600" size={20} />
              <h1 className="text-lg font-bold text-gray-800">התאמה אישית</h1>
            </div>
            <button
              onClick={onStartDesigning}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <Play size={16} />
              התחל לעצב
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-4rem)] overflow-y-auto">
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            {/* Category Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 h-fit">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-purple-600" size={18} />
                  קטגוריות
                </h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as any)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Finish Options */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 h-fit">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  בחר גימור עבור {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {finishOptions[selectedCategory]?.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleFinishChange(selectedCategory, option.id)}
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        customization[selectedCategory] === option.id
                          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-16 rounded-lg mb-2 ${option.preview} transition-all duration-200`}></div>
                      <h3 className="font-medium text-gray-900 text-sm">{option.name}</h3>
                      {customization[selectedCategory] === option.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Live Preview Note */}
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Eye size={16} />
                    <span className="text-sm font-medium">השינויים יוחלו אוטומטית במטבח</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 h-fit">
                <h2 className="text-lg font-bold text-gray-900 mb-4">בחירות נוכחיות</h2>
                
                {/* Selected Finishes Summary */}
                <div className="space-y-3">
                  {Object.entries(customization).map(([category, finish]) => {
                    const categoryData = categories.find(c => c.id === category);
                    const finishData = finishOptions[category as keyof typeof finishOptions]?.find(f => f.id === finish);
                    
                    if (!categoryData || !finishData) return null;
                    
                    return (
                      <div key={category} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-lg ${finishData.preview} border border-gray-200`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{categoryData.name}</div>
                          <div className="text-xs text-gray-600">{finishData.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Start Designing Button */}
                <button
                  onClick={onStartDesigning}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <Play size={16} />
                  התחל לעצב
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  תוכל לחזור ולשנות בכל עת
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;