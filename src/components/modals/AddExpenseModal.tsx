import React, { useState, useEffect } from 'react';
import { X, Plus, Mic, Loader } from 'lucide-react';
import { ExpenseFormData, Currency } from '../../types/expense';
import { startVoiceRecognition, VoiceResult } from '../../utils/voiceRecognition';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  currency: Currency;
  initialData?: Partial<ExpenseFormData>;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currency,
  initialData
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    quantity: '1',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: initialData?.amount || '',
        quantity: initialData?.quantity || '1',
        description: initialData?.description || '',
        date: initialData?.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen, initialData]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast.error('Please fill in amount and description');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      onSubmit(formData);
      
      // Reset form
      setFormData({
        amount: '',
        quantity: '1',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      toast.success('Expense added successfully! 🎉');
      onClose();
    } catch (error) {
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) return;
    
    startVoiceRecognition(
      (result: VoiceResult) => {
        setFormData(prev => ({
          ...prev,
          ...(result.amount && { amount: result.amount.toString() }),
          ...(result.quantity && { quantity: result.quantity.toString() }),
          ...(result.description && { description: result.description }),
          ...(result.date && { date: result.date })
        }));
        
        toast.success('Voice input captured! 🎤');
      },
      (error: string) => {
        toast.error(error);
      },
      () => setIsListening(true),
      () => setIsListening(false)
    );
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-800">Add New Expense</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount and Quantity Row */}
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
                placeholder="1"
                required
              />
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
              placeholder="What did you spend on?"
              required
            />
          </div>
          
          {/* Date and Voice Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
                required
              />
            </div>
            
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
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                }`}
              >
                {isListening ? (
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                    Listening...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Mic size={16} className="mr-2" />
                    Speak
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* Voice Examples */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">
              🎤 Voice Examples:
            </p>
            <p className="text-xs text-blue-600">
              "Pizza 200 rupees", "Coffee 50 yesterday", "Uber 120 today"
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.amount || !formData.description || isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Add Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;