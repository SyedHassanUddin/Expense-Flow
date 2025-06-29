import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Mic, Camera, Loader, Upload, AlertTriangle, Volume2, Tag, Check, ChevronDown } from 'lucide-react';
import { ExpenseFormData, Currency } from '../../types/expense';
import { startVoiceRecognition, VoiceResult } from '../../utils/voiceRecognition';
import { processReceiptImage, ReceiptData } from '../../utils/receiptOCR';
import { getAllCategories, addCustomCategory, categorizeExpense, getCategoryColor } from '../../utils/categories';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData & { category?: string }) => void;
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
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const [ocrError, setOcrError] = useState<string>('');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Load categories on mount
  useEffect(() => {
    setCategories(getAllCategories());
  }, []);

  // Auto-categorize when description changes
  useEffect(() => {
    if (formData.description && !selectedCategory) {
      const autoCategory = categorizeExpense(formData.description);
      setSelectedCategory(autoCategory);
    }
  }, [formData.description, selectedCategory]);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: initialData?.amount || '',
        quantity: initialData?.quantity || '1',
        description: initialData?.description || '',
        date: initialData?.date || new Date().toISOString().split('T')[0]
      });
      setSelectedCategory('');
      setVoiceError('');
      setOcrError('');
      setCurrentTranscript('');
      setShowCategoryDropdown(false);
      setShowNewCategoryInput(false);
      setNewCategoryInput('');
    }
  }, [isOpen, initialData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
        setShowNewCategoryInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        category: selectedCategory || categorizeExpense(formData.description),
        source: initialData?.amount ? 'receipt' : 'manual' // Mark as receipt if came from OCR
      } as ExpenseFormData & { category: string });
      
      // Reset form
      setFormData({
        amount: '',
        quantity: '1',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedCategory('');
      
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
    
    setVoiceError('');
    setCurrentTranscript('');
    
    startVoiceRecognition(
      (result: VoiceResult) => {
        console.log('Voice recognition result:', result);
        
        // Check if we got meaningful data
        if (!result.amount && !result.description) {
          setVoiceError('Could not understand the expense details. Please try speaking more clearly.');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          ...(result.amount && { amount: result.amount.toString() }),
          ...(result.quantity && { quantity: result.quantity.toString() }),
          ...(result.description && { description: result.description }),
          ...(result.date && { date: result.date })
        }));
        
        setCurrentTranscript('');
        toast.success('Voice input captured! 🎤');
      },
      (error: string) => {
        setVoiceError(error);
        setCurrentTranscript('');
        toast.error(error);
      },
      () => {
        setIsListening(true);
        setCurrentTranscript('Listening...');
      },
      () => {
        setIsListening(false);
        setCurrentTranscript('');
      },
      (transcript: string) => {
        // Real-time transcript update
        setCurrentTranscript(transcript);
      }
    );
  };

  const handleReceiptScan = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      const error = 'Please select a valid image file (JPG, PNG, WebP)';
      setOcrError(error);
      toast.error(error);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const error = 'Image file is too large. Please select a file smaller than 10MB';
      setOcrError(error);
      toast.error(error);
      return;
    }

    setIsProcessingReceipt(true);
    setOcrError('');
    
    try {
      const data = await processReceiptImage(file, (progress) => {
        // You can add progress updates here if needed
        console.log('OCR Progress:', progress);
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
        const error = 'Could not extract expense data from receipt. Please try manual entry or a clearer image.';
        setOcrError(error);
        toast.error(error);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process receipt. Please try again.';
      setOcrError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleReceiptScan(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    setShowNewCategoryInput(false);
  };

  const handleAddNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      toast.error('Please enter a category name');
      return;
    }

    if (trimmed.length > 30) {
      toast.error('Category name must be 30 characters or less');
      return;
    }

    const success = addCustomCategory(trimmed);
    if (success) {
      setCategories(getAllCategories());
      setSelectedCategory(trimmed);
      setNewCategoryInput('');
      setShowNewCategoryInput(false);
      setShowCategoryDropdown(false);
      toast.success(`Category "${trimmed}" added! 🏷️`);
    } else {
      toast.error('Category already exists or invalid name');
    }
  };

  const handleNewCategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewCategory();
    }
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
              placeholder="What did you spend on?"
              required
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 text-left flex items-center justify-between"
              >
                <div className="flex items-center">
                  {selectedCategory && (
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getCategoryColor(selectedCategory) }}
                    ></div>
                  )}
                  <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedCategory || 'Select category...'}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center transition-colors"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: getCategoryColor(category) }}
                      ></div>
                      <span className="text-gray-900">{category}</span>
                      {selectedCategory === category && (
                        <Check size={16} className="text-blue-500 ml-auto" />
                      )}
                    </button>
                  ))}
                  
                  {/* Add New Category Option */}
                  <div className="border-t border-gray-200">
                    {!showNewCategoryInput ? (
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(true)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-blue-600 transition-colors"
                      >
                        <Plus size={16} className="mr-3" />
                        <span>Add new category</span>
                      </button>
                    ) : (
                      <div className="p-3 space-y-2">
                        <input
                          type="text"
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          onKeyPress={handleNewCategoryKeyPress}
                          placeholder="Enter category name..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                          maxLength={30}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddNewCategory}
                            className="flex-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryInput('');
                            }}
                            className="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
              required
            />
          </div>

          {/* Voice Recognition Display */}
          {(isListening || currentTranscript) && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Volume2 size={16} className="text-purple-600 mr-2" />
                <h4 className="text-sm font-semibold text-purple-800">
                  {isListening ? 'Listening...' : 'Processing...'}
                </h4>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-gray-800 min-h-[20px]">
                  {currentTranscript || 'Speak now... Example: "Coffee 50 rupees today"'}
                </p>
              </div>
              {isListening && (
                <div className="flex items-center mt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs text-purple-600 ml-2">Recording audio...</span>
                </div>
              )}
            </div>
          )}

          {/* Input Methods Row */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Input
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Voice Input */}
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isListening || isProcessingReceipt}
                className={`px-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                } disabled:opacity-50`}
              >
                {isListening ? (
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mb-1"></div>
                    <span className="text-xs">Listening</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Mic size={16} className="mb-1" />
                    <span className="text-xs">Voice</span>
                  </div>
                )}
              </button>

              {/* Camera Capture */}
              <button
                type="button"
                onClick={handleCameraCapture}
                disabled={isListening || isProcessingReceipt}
                className="px-3 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-300"
              >
                {isProcessingReceipt ? (
                  <div className="flex flex-col items-center">
                    <Loader size={16} className="animate-spin mb-1" />
                    <span className="text-xs">Processing</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera size={16} className="mb-1" />
                    <span className="text-xs">Camera</span>
                  </div>
                )}
              </button>

              {/* Upload Receipt */}
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isListening || isProcessingReceipt}
                className="px-3 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300"
              >
                <div className="flex flex-col items-center">
                  <Upload size={16} className="mb-1" />
                  <span className="text-xs">Upload</span>
                </div>
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {voiceError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-start">
                <AlertTriangle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">Voice Recognition Error</h4>
                  <p className="text-sm text-red-700">{voiceError}</p>
                </div>
              </div>
            </div>
          )}

          {ocrError && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="flex items-start">
                <AlertTriangle size={16} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-800 mb-1">Receipt Scanning Error</h4>
                  <p className="text-sm text-orange-700">{ocrError}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">
              💡 Quick Input Options:
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <div>🎤 <strong>Voice:</strong> "Pizza 200 rupees today"</div>
              <div>📷 <strong>Camera:</strong> Take photo of receipt</div>
              <div>📤 <strong>Upload:</strong> Select receipt from gallery</div>
              <div>🏷️ <strong>Category:</strong> Auto-detected or select/create custom</div>
            </div>
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
              disabled={!formData.amount || !formData.description || isSubmitting || isProcessingReceipt}
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