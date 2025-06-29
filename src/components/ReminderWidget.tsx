import React, { useState, useEffect } from 'react';
import { X, Clock, Plus } from 'lucide-react';

interface ReminderWidgetProps {
  onAddExpense: () => void;
}

const ReminderWidget: React.FC<ReminderWidgetProps> = ({ onAddExpense }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if reminder was dismissed today
    const dismissedDate = localStorage.getItem('expense-reminder-dismissed');
    const today = new Date().toDateString();
    
    if (dismissedDate !== today) {
      // Show reminder after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Remember dismissal for today
    localStorage.setItem('expense-reminder-dismissed', new Date().toDateString());
  };

  const handleAddExpense = () => {
    onAddExpense();
    handleDismiss();
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 mb-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-lg animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 rounded-full p-2">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">
                Did you record your expenses today? 😊
              </h3>
              <p className="text-sm text-amber-600">
                Stay on track with your spending goals
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddExpense}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Now
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderWidget;