import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader, CheckCircle, XCircle, Eye } from 'lucide-react';
import { processReceiptImage, ReceiptData, OCRProgress } from '../utils/receiptOCR';
import { ExpenseFormData } from '../types/expense';

interface ReceiptScannerProps {
  onDataExtracted: (data: Partial<ExpenseFormData>) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onDataExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please select a file smaller than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset states
    setError('');
    setExtractedData(null);
    setIsProcessing(true);
    setProgress({ status: 'initializing', progress: 0 });

    try {
      const data = await processReceiptImage(file, (progressInfo) => {
        setProgress(progressInfo);
      });

      setExtractedData(data);
      setIsProcessing(false);

      // Auto-fill form if data was extracted
      if (data.amount || data.date || data.description) {
        const formData: Partial<ExpenseFormData> = {};
        
        if (data.amount) {
          formData.amount = data.amount.toString();
        }
        
        if (data.date) {
          formData.date = data.date;
        }
        
        if (data.description) {
          formData.description = data.description;
        }

        onDataExtracted(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process receipt');
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getProgressMessage = () => {
    switch (progress.status) {
      case 'initializing':
        return 'Initializing OCR engine...';
      case 'loading':
        return 'Loading OCR models...';
      case 'recognizing text':
        return 'Scanning receipt text...';
      default:
        return 'Processing receipt...';
    }
  };

  const clearResults = () => {
    setExtractedData(null);
    setPreviewImage('');
    setError('');
    setShowRawText(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-3 mr-4">
            <Camera size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Scan Receipt</h2>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!previewImage ? (
              <div>
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Upload Receipt Image
                </h3>
                <p className="text-gray-500 mb-4">
                  Take a photo or upload an image of your receipt
                </p>
                <button
                  onClick={handleUploadClick}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                >
                  <Camera size={20} className="inline mr-2" />
                  Choose Image
                </button>
              </div>
            ) : (
              <div>
                <img
                  src={previewImage}
                  alt="Receipt preview"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md mb-4"
                />
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleUploadClick}
                    disabled={isProcessing}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={clearResults}
                    disabled={isProcessing}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Loader size={24} className="text-blue-500 animate-spin mr-3" />
                <h3 className="text-lg font-semibold text-blue-800">
                  Processing Receipt
                </h3>
              </div>
              <p className="text-blue-600 mb-3">{getProgressMessage()}</p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(progress.progress * 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-500 mt-2">
                {Math.round(progress.progress * 100)}% complete
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <XCircle size={20} className="text-red-500 mr-3" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedData && !isProcessing && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle size={24} className="text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-green-800">
                  Data Extracted Successfully
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {extractedData.amount && (
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ${extractedData.amount}
                    </p>
                  </div>
                )}
                
                {extractedData.date && (
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(extractedData.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {extractedData.description && (
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {extractedData.description}
                    </p>
                  </div>
                )}
              </div>

              {extractedData.items && extractedData.items.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Items Found</p>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.items.map((item, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.rawText && (
                <div className="border-t border-green-200 pt-4">
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Eye size={16} className="mr-2" />
                    {showRawText ? 'Hide' : 'Show'} Raw Text
                  </button>
                  
                  {showRawText && (
                    <div className="mt-3 bg-gray-100 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {extractedData.rawText}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📸 Tips for Better Results
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Ensure the receipt is well-lit and clearly visible</li>
              <li>• Keep the receipt flat and avoid shadows</li>
              <li>• Make sure all text is in focus</li>
              <li>• Crop the image to show only the receipt if possible</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;