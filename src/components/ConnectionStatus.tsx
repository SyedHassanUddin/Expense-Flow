import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Database, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { supabase } from '../lib/supabase';

const ConnectionStatus: React.FC = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test Supabase connection
        const { data, error } = await supabase.from('expenses').select('count').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setIsConnected(false);
        } else {
          console.log('Supabase connection successful');
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setIsConnected(false);
      }
    };

    // Check connection on mount
    checkConnection();

    // Set up periodic connection checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-hide after 10 seconds if connected
  useEffect(() => {
    if (isConnected === true) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!isVisible || isConnected === null) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className={`glass-card dark:glass-card-dark rounded-xl p-4 shadow-xl transition-all duration-300 ${
        isConnected ? 'border-green-400/30' : 'border-red-400/30'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <AlertCircle size={20} className="text-red-400" />
            )}
            <h3 className="font-semibold text-white text-sm">
              {isConnected ? 'Connected to Supabase' : 'Connection Issue'}
            </h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/60 hover:text-white text-sm"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Database size={14} className={isConnected ? 'text-green-400' : 'text-red-400'} />
            <span className="text-white/80">
              Database: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-white/80">
                  Authenticated: {user.email?.split('@')[0]}
                </span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-yellow-400" />
                <span className="text-white/80">
                  Local Mode: No account
                </span>
              </>
            )}
          </div>
        </div>
        
        {isConnected && (
          <div className="mt-3 p-2 bg-green-500/20 border border-green-400/30 rounded-lg">
            <p className="text-xs text-green-200">
              ✅ All features available: Cloud sync, authentication, and cross-device access
            </p>
          </div>
        )}
        
        {!isConnected && (
          <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
            <p className="text-xs text-yellow-200">
              ⚠️ Using local storage mode. Data won't sync across devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;