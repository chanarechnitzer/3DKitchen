import React from 'react';
import { ChefHat, Target, ArrowLeft } from 'lucide-react';

interface WelcomeScreenProps {
  onStartDesign: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartDesign }) => {
  return (
    <div className="h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-yellow-500 rounded-2xl mb-4 shadow-lg">
            <ChefHat className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
            הניסיון הראשון שלכם
            <span className="text-primary"> כמעצבים</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            למד ותרגל את עקרון המשולש הזהב בתכנון מטבחים - הכלי המקצועי לעיצוב מטבחים פונקציונליים ויעילים
          </p>
        </div>

        {/* Golden Triangle Explanation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">מה זה המשולש הזהב?</h2>
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            המשולש הזהב הוא עקרון יסוד בתכנון מטבחים המחבר בין שלושת אזורי העבודה המרכזיים במטבח:
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl mb-2">💧</div>
              <h3 className="font-bold text-gray-900 mb-1">אזור המים</h3>
              <p className="text-gray-600 text-sm">כיור ומדיח כלים</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="font-bold text-gray-900 mb-1">אזור החום</h3>
              <p className="text-gray-600 text-sm">כיריים ותנור</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl mb-2">❄️</div>
              <h3 className="font-bold text-gray-900 mb-1">אזור האחסון</h3>
              <p className="text-gray-600 text-sm">מקרר ומזווה</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-yellow-500/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="text-primary mt-1" size={18} />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">חוקי המשולש הזהב:</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    כל צלע במשולש חייבת להיות <strong>ארוכה מ-1.2 מטר</strong> (למניעת צפיפות)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    כל צלע במשולש חייבת להיות <strong>קצרה מ-5 מטר</strong> (ליעילות בעבודה)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    המשולש לא צריך להיות חסום על ידי רהיטים או קירות
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
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