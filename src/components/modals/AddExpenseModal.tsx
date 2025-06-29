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
  const stopRecognitionRef = useRef<(() => void) | null>(null);

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

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast.error('Please fill in amount and description');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onSubmit({
        ...formData,
        source: initialData?.amount ? 'receipt' : 'manual'
      } as ExpenseFormData);
      
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
    if (isListening) {
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
      }
      return;
    }
    
    const stopRecognition = startVoiceRecognition(
      (result: VoiceResult) => {
        setFormData(prev => ({
          ...prev,
          ...(result.amount && { amount: result.amount.toString() }),
          ...(result.quantity && { quantity: result.quantity.toString() }),
          ...(result.description && { description: result.description }),
          ...(result.date && { date: result.date })
        }));
        
        toast.success('Voice input captured! 🎤');
        setIsListening(false);
        stopRecognitionRef.current = null;
      },
      (error: string) => {
        toast.error(error);
        setIsListening(false);
        stopRecognitionRef.current = null;
      },
      () => {
        setIsListening(true);
        toast.success('Listening... Speak now!', { duration: 2000 });
      },
      () => {
        setIsListening(false);
        stopRecognitionRef.current = null;
      }
    );
    
    stopRecognitionRef.current = stopRecognition;
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
        // Progress updates
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

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
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

      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add New Expense</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="form-input"
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="form-input"
                placeholder="1"
                required
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-input"
              placeholder="What did you spend on?"
              required
            />
          </div>
          
          {/* Date */}
          <div className="form-group">
            <label className="form-label">Smart Date Autofill</label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="form-input pl-10"
                required
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" size={16} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sets today's date automatically on app load
            </p>
          </div>

          {/* Quick Input Methods */}
          <div className="form-group">
            <label className="form-label">Quick Input Methods</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Voice Input */}
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isProcessingReceipt}
                className={`p-4 rounded-xl font-medium transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                } disabled:opacity-50 flex flex-col items-center`}
              >
                {isListening ? (
                  <>
                    <div className="flex space-x-1 mb-2">
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs">Listening</span>
                  </>
                ) : (
                  <>
                    <Mic size={20} className="mb-2" />
                    <span className="text-xs">Voice</span>
                  </>
                )}
              </button>

              {/* Camera */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isListening || isProcessingReceipt}
                className="p-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 transition-all duration-300 flex flex-col items-center"
              >
                {isProcessingReceipt ? (
                  <>
                    <Loader size={20} className="animate-spin mb-2" />
                    <span className="text-xs">Processing</span>
                  </>
                ) : (
                  <>
                    <Camera size={20} className="mb-2" />
                    <span className="text-xs">Camera</span>
                  </>
                )}
              </button>

              {/* Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isListening || isProcessingReceipt}
                className="p-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-all duration-300 flex flex-col items-center"
              >
                <Upload size={20} className="mb-2" />
                <span className="text-xs">Upload</span>
              </button>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700 font-semibold mb-2">
              💡 Quick Input Options:
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <div>🎤 <strong>Voice:</strong> "Pizza 100 rupees 5 quantity June 10"</div>
              <div>📷 <strong>Camera:</strong> Take photo of receipt</div>
              <div>📤 <strong>Upload:</strong> Select receipt from gallery</div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.amount || !formData.description || isSubmitting || isProcessingReceipt}
              className="flex-1 btn-primary justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
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