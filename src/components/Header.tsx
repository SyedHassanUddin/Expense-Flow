import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, LogOut, CreditCard, Settings, TrendingUp } from 'lucide-react';
import { products } from '../stripe-config';

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSubscription();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchSubscription();
        } else {
          setSubscription(null);
          setLoading(false);
        }
      }
    );

    return () => authSubscription.unsubscribe();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    navigate('/login');
  };

  const getSubscriptionDisplay = () => {
    if (!subscription || subscription.subscription_status !== 'active') {
      return 'Free Plan';
    }

    const currentProduct = products.find(p => p.priceId === subscription.price_id);
    return currentProduct?.name || 'Premium Plan';
  };

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp size={24} className="text-blue-500 mr-2" />
              <span className="text-xl font-bold text-gray-800">ExpenseFlow</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp size={24} className="text-blue-500 mr-2" />
              <span className="text-xl font-bold text-gray-800">ExpenseFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp size={24} className="text-blue-500 mr-2" />
            <span className="text-xl font-bold text-gray-800">ExpenseFlow</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Subscription Status */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1">
              <CreditCard size={16} className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {getSubscriptionDisplay()}
              </span>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2 hover:bg-gray-200 transition-colors"
              >
                <User size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.email?.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user.email}</p>
                    <p className="text-xs text-gray-500">{getSubscriptionDisplay()}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate('/subscription');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <CreditCard size={16} className="mr-3" />
                    Subscription
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Header;