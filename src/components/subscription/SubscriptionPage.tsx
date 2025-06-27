import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { products, Product } from '../../stripe-config';
import { CreditCard, Check, Loader, Star, Zap } from 'lucide-react';

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

const SubscriptionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setMessage({ type: 'error', text: 'Failed to load subscription data' });
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (product: Product) => {
    setCheckoutLoading(product.id);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/subscription`,
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

  const getSubscriptionStatus = () => {
    if (!subscription) return null;

    const isActive = subscription.subscription_status === 'active';
    const currentProduct = products.find(p => p.priceId === subscription.price_id);
    
    return {
      isActive,
      productName: currentProduct?.name || 'Unknown Plan',
      expiresAt: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
        : null,
      willCancel: subscription.cancel_at_period_end
    };
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

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

        {/* Current Subscription Status */}
        {subscriptionStatus?.isActive && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <Check size={24} className="text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-green-800">Active Subscription</h3>
            </div>
            <p className="text-green-700 mb-2">
              You're currently subscribed to <strong>{subscriptionStatus.productName}</strong>
            </p>
            {subscriptionStatus.expiresAt && (
              <p className="text-green-600 text-sm">
                {subscriptionStatus.willCancel 
                  ? `Subscription will end on ${subscriptionStatus.expiresAt}`
                  : `Next billing date: ${subscriptionStatus.expiresAt}`
                }
              </p>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const isCurrentPlan = subscriptionStatus?.isActive && 
              subscription?.price_id === product.priceId;
            
            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl shadow-lg p-8 relative transition-all duration-300 hover:shadow-xl ${
                  isCurrentPlan ? 'ring-2 ring-green-500' : ''
                }`}
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

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
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
                  disabled={checkoutLoading === product.id || isCurrentPlan}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : checkoutLoading === product.id
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg'
                  }`}
                >
                  {checkoutLoading === product.id ? (
                    <>
                      <Loader size={20} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
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