import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-blue-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle size={48} className="text-green-500" />
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your payment has been processed successfully and you now have access to premium features.
        </p>

        {/* Features Unlocked */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            What's Next?
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Access to premium features</span>
            </div>
            <div className="flex items-center">
              <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Enhanced expense tracking</span>
            </div>
            <div className="flex items-center">
              <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Priority customer support</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg flex items-center justify-center"
          >
            <TrendingUp size={20} className="mr-2" />
            Go to ExpenseFlow
          </button>
          
          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
          >
            View Subscription Details
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>

        {/* Auto-redirect Notice */}
        <p className="text-sm text-gray-500 mt-6">
          You'll be automatically redirected to ExpenseFlow in a few seconds...
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;