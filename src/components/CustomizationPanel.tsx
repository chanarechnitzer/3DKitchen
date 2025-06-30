import React, { useState } from 'react';
import { ArrowRight, Palette, Sparkles, Download, Share2 } from 'lucide-react';

interface CustomizationPanelProps {
  onBackToDesign: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ onBackToDesign }) => {
  const [selectedCategory, setSelectedCategory] = useState<'cabinets' | 'countertops' | 'walls' | 'floors'>('cabinets');
  const [selectedFinishes, setSelectedFinishes] = useState({
    cabinets: 'white',
    countertops: 'granite',
    walls: 'light',
    floors: 'wood'
  });

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

  const handleFinishChange = (category: string, finishId: string) => {
    setSelectedFinishes(prev => ({
      ...prev,
      [category]: finishId
    }));
  };

  const handleSave = () => {
    // Here you would typically save the customization
    alert('העיצוב נשמר בהצלחה! 🎉');
  };

  const handleShare = () => {
    // Here you would typically implement sharing functionality
    alert('קישור לעיצוב הועתק ללוח! 📋');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBackToDesign}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              <ArrowRight size={16} />
              חזור לעיצוב
            </button>
            <div className="flex items-center gap-3">
              <Palette className="text-purple-600" size={24} />
              <h1 className="text-xl font-bold text-gray-800">התאמה אישית</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <Share2 size={16} />
                שתף
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Download size={16} />
                שמור
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-600" size={20} />
                קטגוריות
              </h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Finish Options */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                בחר גימור עבור {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {finishOptions[selectedCategory]?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleFinishChange(selectedCategory, option.id)}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedFinishes[selectedCategory] === option.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-20 rounded-lg mb-3 ${option.preview}`}></div>
                    <h3 className="font-medium text-gray-900">{option.name}</h3>
                    {selectedFinishes[selectedCategory] === option.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">תצוגה מקדימה</h2>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Palette className="text-white" size={24} />
                  </div>
                  <p className="text-gray-600 text-sm">
                    תצוגה מקדימה של המטבח
                    <br />
                    עם הגימורים שנבחרו
                  </p>
                </div>
              </div>
              
              {/* Selected Finishes Summary */}
              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-gray-900 text-sm">גימורים נבחרים:</h3>
                {Object.entries(selectedFinishes).map(([category, finish]) => {
                  const categoryName = categories.find(c => c.id === category)?.name;
                  const finishName = finishOptions[category as keyof typeof finishOptions]?.find(f => f.id === finish)?.name;
                  return (
                    <div key={category} className="flex justify-between text-xs text-gray-600">
                      <span>{categoryName}:</span>
                      <span className="font-medium">{finishName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;