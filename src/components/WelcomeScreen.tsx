import React from 'react';
import { ChefHat, Sparkles, Target, Ruler, Palette, ArrowLeft } from 'lucide-react';

interface WelcomeScreenProps {
  onStartDesign: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartDesign }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-2xl mb-6 shadow-lg">
            <ChefHat className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            מעצב המטבח
            <span className="text-primary"> המקצועי</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            למד ותרגל את עקרון המשולש הזהב בתכנון מטבחים - הכלי המקצועי לעיצוב מטבחים פונקציונליים ויעילים
          </p>
        </div>

        {/* Golden Triangle Explanation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">מה זה המשולש הזהב?</h2>
          </div>
          
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            המשולש הזהב הוא עקרון יסוד בתכנון מטבחים המחבר בין שלושת אזורי העבודה המרכזיים במטבח:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-4xl mb-3">💧</div>
              <h3 className="font-bold text-gray-900 mb-2">אזור המים</h3>
              <p className="text-gray-600">כיור ומדיח כלים</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="font-bold text-gray-900 mb-2">אזור החום</h3>
              <p className="text-gray-600">כיריים ותנור</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-4xl mb-3">❄️</div>
              <h3 className="font-bold text-gray-900 mb-2">אזור האחסון</h3>
              <p className="text-gray-600">מקרר ומזווה</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-yellow-500/10 rounded-xl p-6 border border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="text-primary mt-1" size={20} />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">חוקי המשולש הזהב:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    כל צלע במשולש חייבת להיות <strong>ארוכה מ-1.2 מטר</strong> (למניעת צפיפות)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    כל צלע במשולש חייבת להיות <strong>קצרה מ-5 מטר</strong> (ליעילות בעבודה)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    המשולש לא צריך להיות חסום על ידי רהיטים או קירות
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Ruler className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">מידות מדויקות</h3>
            <p className="text-gray-600">עבוד עם מידות אמיתיות וקבל משוב בזמן אמת על המרחקים</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Target className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">הצמדה חכמה</h3>
            <p className="text-gray-600">הרהיטים נצמדים אוטומטית לקירות ולמיקומים אופטימליים</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Palette className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">התאמה אישית</h3>
            <p className="text-gray-600">בחר צבעים, חומרים וגימורים לפי הטעם האישי שלך</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onStartDesign}
            className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary to-yellow-500 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span>בואו נתחיל לעצב!</span>
            <ArrowLeft className="group-hover:translate-x-1 transition-transform duration-300" size={20} />
          </button>
          <p className="text-gray-500 mt-3">חינם לחלוטין • ללא הרשמה</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;