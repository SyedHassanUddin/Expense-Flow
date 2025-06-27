import React, { useState } from 'react';
import { Plus, Mic, MicOff, Loader } from 'lucide-react';
import { ExpenseFormData, Currency } from '../types/expense';
import { startVoiceRecognition, VoiceResult } from '../utils/voiceRecognition';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  currency: Currency;
  initialData?: Partial<ExpenseFormData>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, currency, initialData }) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: initialData?.amount || '',
    quantity: initialData?.quantity || '1',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });
  
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const [lastVoiceResult, setLastVoiceResult] = useState<string>('');

  // Update form data when initialData changes (from OCR)
  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      return;
    }
    
    onSubmit(formData);
    setFormData({
      amount: '',
      quantity: '1',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setLastVoiceResult('');
  };

  const handleVoiceInput = () => {
    if (isListening) return;
    
    setVoiceError('');
    setLastVoiceResult('');
    
    startVoiceRecognition(
      (result: VoiceResult) => {
        console.log('Voice recognition result:', result);
        
        // Store what was recognized for display
        const recognizedParts = [];
        if (result.description) recognizedParts.push(`"${result.description}"`);
        if (result.amount) recognizedParts.push(`${result.amount} ${currency}`);
        if (result.quantity && result.quantity > 1) recognizedParts.push(`${result.quantity} qty`);
        if (result.date) {
          const dateObj = new Date(result.date);
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          let dateDisplay = result.date;
          if (dateObj.toDateString() === today) {
            dateDisplay = 'today';
          } else if (dateObj.toDateString() === yesterday) {
            dateDisplay = 'yesterday';
          } else {
            dateDisplay = dateObj.toLocaleDateString();
          }
          recognizedParts.push(dateDisplay);
        }
        
        if (recognizedParts.length > 0) {
          setLastVoiceResult(`Recognized: ${recognizedParts.join(', ')}`);
        }
        
        // Apply voice results to form
        setFormData(prev => ({
          ...prev,
          ...(result.amount && { amount: result.amount.toString() }),
          ...(result.quantity && { quantity: result.quantity.toString() }),
          ...(result.description && { description: result.description }),
          ...(result.date && { date: result.date })
        }));
      },
      (error: string) => {
        setVoiceError(error);
      },
      () => {
        setIsListening(true);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-12">
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 mr-4">
            <Plus size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Add New Expense</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
                required
              />
            </div>
            
            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="1"
                required
              />
            </div>
            
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            {/* Voice Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Input
              </label>
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-center">
                  {isListening ? (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic size={20} className="mr-2" />
                      Speak
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
          
          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="What did you spend on? (e.g., Pizza dinner, Uber ride, Movie tickets)"
              required
            />
          </div>
          
          {/* Voice Result Display */}
          {lastVoiceResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700">
                ✅ {lastVoiceResult}
              </p>
            </div>
          )}
          
          {/* Voice Error */}
          {voiceError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">❌ {voiceError}</p>
            </div>
          )}
          
          {/* Voice Examples */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-medium mb-2">
              🎤 <strong>Voice Command Examples:</strong>
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <div>• "Bought pizza for 200 rupees, 2 quantity, yesterday"</div>
              <div>• "On June 10th, paid electricity bill of 500"</div>
              <div>• "Groceries 120 rupees 3 quantity today"</div>
              <div>• "Doctor visit 600 rupees last Monday"</div>
              <div>• "Movie tickets 350 rupees 2 quantity"</div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!formData.amount || !formData.description}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center">
                <Plus size={20} className="mr-2" />
                Add Expense
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;