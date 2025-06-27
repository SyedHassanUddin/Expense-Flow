import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { products, Product } from '../../stripe-config';
import { CreditCard, Check, Loader, Star, Zap } from 'lucide-react';

const SubscriptionPage: React.FC = () => {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async (product: Product) => {
    setCheckoutLoading(product.id);
    setMessage(null);

    try {
      // For demo purposes without authentication, we'll create a simple checkout
      // In a real app, you'd need some form of user identification
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/subscription`,
          customer_email: 'demo@example.com', // Demo email for testing
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to start checkout process' });
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Unlock premium features and enhance your expense tracking experience
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg p-8 relative transition-all duration-300 hover:shadow-xl"
              >
                {/* Popular Badge */}
                {product.name === 'Jio Recharge' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star size={14} className="mr-1" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Zap size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {product.price}
                    {product.mode === 'subscription' && (
                      <span className="text-lg font-normal text-gray-500">/month</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center">
                    <Check size={16} className="text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited data and calls</span>
                  </div>
                  <div className="flex items-center">
                    <Check size={16} className="text-green-500 mr-3" />
                    <span className="text-gray-700">High-speed internet</span>
                  </div>
                  <div className="flex items-center">
                    <Check size={16} className="text-green-500 mr-3" />
                    <span className="text-gray-700">Premium support</span>
                  </div>
                  <div className="flex items-center">
                    <Check size={16} className="text-green-500 mr-3" />
                    <span className="text-gray-700">Auto-renewal</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleCheckout(product)}
                  disabled={checkoutLoading === product.id}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                    checkoutLoading === product.id
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg'
                  }`}
                >
                  {checkoutLoading === product.id ? (
                    <>
                      <Loader size={20} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} className="mr-2" />
                      {product.mode === 'subscription' ? 'Subscribe Now' : 'Buy Now'}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Back to App */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            ← Back to ExpenseFlow
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;