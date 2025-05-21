import React from 'react';
import { X } from 'lucide-react';

interface RulesProps {
  onMinimize: () => void;
}

const Rules: React.FC<RulesProps> = ({ onMinimize }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary">המשולש הזהב למטבח</h1>
        <button 
          onClick={onMinimize}
          className="text-gray-500 hover:text-gray-700"
          aria-label="מזער"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="text-lg space-y-4">
        <p>המשולש הזהב הוא כלל תכנון בסיסי במטבחים המחבר בין שלושה אזורים מרכזיים:</p>
        
        <div className="flex flex-col gap-4 my-6 pr-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <p><strong>חום</strong> - כיריים ותנור</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <p><strong>מים</strong> - כיור</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">❄️</span>
            <p><strong>אחסון</strong> - מקרר</p>
          </div>
        </div>
        
        <p className="font-bold">חוקי המשולש:</p>
        <ul className="list-disc pr-6">
          <li>כל צלע של המשולש (המרחק בין כל שני רכיבים) חייבת להיות <strong>ארוכה מ-1.2 מטר</strong>.</li>
          <li>כל צלע של המשולש חייבת להיות <strong>קצרה מ-5 מטר</strong>.</li>
        </ul>
        
        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <p className="font-medium">📌 המטרה שלך:</p>
          <p>גרור את רכיבי המטבח למקומם בחלל התלת-ממדי ומקם אותם בהתאם לכלל המשולש הזהב.</p>
        </div>
      </div>
      
      <button 
        onClick={onMinimize}
        className="btn btn-primary mt-6 w-full"
      >
        הבנתי, בואו נתחיל!
      </button>
    </div>
  );
};

export default Rules;