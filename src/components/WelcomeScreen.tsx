import React from 'react';
import { ChefHat, Target, ArrowLeft } from 'lucide-react';

interface WelcomeScreenProps {
  onStartDesign: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartDesign }) => {
  return (
    <div className="h-screen flex items-center justify-center p-4 overflow-auto">
      <div className="max-w-4xl mx-auto py-4">
        {/* Hero Section */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-yellow-500 rounded-2xl mb-3 shadow-lg">
            <ChefHat className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
            הניסיון הראשון שלכם
            <span className="text-primary"> כמעצבים</span>
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            למד ותרגל את עקרון משולש הזהב בתכנון מטבחים - הכלי המקצועי לעיצוב מטבחים פונקציונליים ויעילים
          </p>
        </div>

        {/* Golden Triangle Explanation */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Target className="text-white" size={16} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">מה זה משולש הזהב?</h2>
          </div>
          
          <p className="text-gray-700 mb-3 leading-relaxed text-sm">
            משולש הזהב הוא עקרון יסוד בתכנון מטבחים המחבר בין שלושת אזורי העבודה המרכזיים במטבח:
          </p>
          
          {/* ✅ SMALLER: Compact squares with readable text */}
          <div className="grid md:grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-lg mb-1">💧</div>
              <h3 className="font-bold text-gray-900 mb-1 text-xs">אזור המים</h3>
              <p className="text-gray-600 text-xs">כיור</p>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <div className="text-lg mb-1">🔥</div>
              <h3 className="font-bold text-gray-900 mb-1 text-xs">אזור החום</h3>
              <p className="text-gray-600 text-xs">כיריים</p>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-lg mb-1">❄️</div>
              <h3 className="font-bold text-gray-900 mb-1 text-xs">אזור האחסון</h3>
              <p className="text-gray-600 text-xs">מקרר ומזווה</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-yellow-500/10 rounded-xl p-3 border border-primary/20">
            <div className="flex items-start gap-2">
              <Target className="text-primary mt-1" size={16} />
              <div>
                <h4 className="font-bold text-gray-900 mb-2 text-sm">🎯 חוקי משולש הזהב</h4>
                <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
                  <p>🔹 כל צלע במשולש צריכה להיות <strong>יותר מ־1.2 מטר</strong> – כדי שלא תרגישו צפוף מדי.</p>
                  <p>🔹 כל צלע צריכה להיות <strong>פחות מ־5 מטר</strong> – כדי שלא תרגישו שאתם רצים מרתון בין הכיור למקרר.</p>
                  <p>🔹 המשולש חייב להישאר <strong>פתוח ונגיש</strong> – בלי רהיטים, קירות או מכשולים שחוסמים את התנועה.</p>
                  
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800 text-xs mb-1">💡 שימו לב: התנור אינו אחד הקודקודים במשולש.</p>
                    <p className="text-blue-700 text-xs">המשולש כולל רק את הכיריים, הכיור והמקרר – שלושת התחנות המרכזיות בעבודת המטבח.</p>
                  </div>
                  
                  <p className="mt-2 text-xs">🔹 הצלעות של המשולש הן משטחי השיש, שמחברים בין התחנות.</p>
                  <p className="text-xs">מומלץ לתכנן משטח עבודה בין כל פונקציה – להנחה, חיתוך, והכנה של חומרי הגלם.</p>
                  <p className="text-xs">לא חייבים לצייר משולש שלם, אבל חשוב לשמור על רצף עבודה נוח ויעיל.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FIXED: CTA Button - Always visible */}
        <div className="text-center">
          <button
            onClick={onStartDesign}
            className="group inline-flex items-center gap-3 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-primary to-yellow-500 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span>בואו נתחיל לעצב!</span>
            <ArrowLeft className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
          </button>
          <p className="text-gray-500 mt-2 text-sm">חינם לחלוטין • ללא הרשמה</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;