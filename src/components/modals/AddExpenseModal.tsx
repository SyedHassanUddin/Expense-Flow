import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Mic, Camera, Loader, Upload, Calendar } from 'lucide-react';
import { ExpenseFormData, Currency } from '../../types/expense';
import { startVoiceRecognition, VoiceResult } from '../../utils/voiceRecognition';
import { processReceiptImage, ReceiptData } from '../../utils/receiptOCR';
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
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      onSubmit({
        ...formData,
        source: initialData?.amount ? 'receipt' : 'manual' // Mark as receipt if came from OCR
      } as ExpenseFormData);
      
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

  const handleReceiptScan = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file is too large. Please select a file smaller than 10MB');
      return;
    }

    setIsProcessingReceipt(true);
    
    try {
      const data = await processReceiptImage(file, (progress) => {
        // You can add progress updates here if needed
      });

      if (data.amount || data.date || data.description) {
        setFormData(prev => ({
          ...prev,
          ...(data.amount && { amount: data.amount.toString() }),
          ...(data.date && { date: data.date }),
          ...(data.description && { description: data.description })
        }));
        
        toast.success('Receipt scanned successfully! 📷');
      } else {
        toast.error('Could not extract data from receipt. Please try again or enter manually.');
      }
    } catch (error) {
      toast.error('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleReceiptScan(file);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md notebook-card max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-800">Add New Expense</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount and Quantity Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-medium"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-medium"
                placeholder="1"
                required
              />
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-medium"
              placeholder="What did you spend on?"
              required
            />
          </div>
          
          {/* Date with Smart Autofill Badge */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Smart Date Autofill
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-medium"
                required
              />
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500" size={16} />
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Sets today's date automatically on app load
            </p>
          </div>

          {/* Input Methods Row */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Quick Input Methods
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Voice Input */}
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isListening || isProcessingReceipt}
                className={`p-4 rounded-2xl font-bold transition-all duration-300 border-2 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse border-red-600'
                    : 'bg-purple-500 text-white hover:bg-purple-600 border-purple-600 soft-hover'
                } disabled:opacity-50`}
              >
                {isListening ? (
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-1 mb-2">
                      <div className="voice-wave w-1 h-4 bg-white rounded-full"></div>
                      <div className="voice-wave w-1 h-3 bg-white rounded-full"></div>
                      <div className="voice-wave w-1 h-5 bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs">Listening</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Mic size={20} className="mb-2" />
                    <span className="text-xs">Voice</span>
                  </div>
                )}
              </button>

              {/* Camera Capture */}
              <button
                type="button"
                onClick={handleCameraCapture}
                disabled={isListening || isProcessingReceipt}
                className="p-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 disabled:opacity-50 transition-all duration-300 border-2 border-green-600 soft-hover"
              >
                {isProcessingReceipt ? (
                  <div className="flex flex-col items-center">
                    <Loader size={20} className="animate-spin mb-2" />
                    <span className="text-xs">Processing</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera size={20} className="mb-2" />
                    <span className="text-xs">Camera</span>
                  </div>
                )}
              </button>

              {/* Upload Receipt */}
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isListening || isProcessingReceipt}
                className="p-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-all duration-300 border-2 border-orange-600 soft-hover"
              >
                <div className="flex flex-col items-center">
                  <Upload size={20} className="mb-2" />
                  <span className="text-xs">Upload</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-700 font-bold mb-2">
              💡 Quick Input Options:
            </p>
            <div className="text-sm text-blue-600 space-y-1 font-medium">
              <div>🎤 <strong>Voice:</strong> "Pizza 100 rupees 5 quantity June 10"</div>
              <div>📷 <strong>Camera:</strong> Take photo of receipt</div>
              <div>📤 <strong>Upload:</strong> Select receipt from gallery</div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.amount || !formData.description || isSubmitting || isProcessingReceipt}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center soft-hover"
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