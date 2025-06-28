import React, { useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Banknote, Link as LinkIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { Expense, Currency } from '../types/expense';
import { categorizeExpense } from '../utils/categories';
import { createLinkToken, exchangePublicToken, getTransactions } from '../utils/plaidApi';

interface BankConnectionProps {
  onTransactionsImported: (transactions: Expense[]) => void;
  currency: Currency;
}

const BankConnection: React.FC<BankConnectionProps> = ({ onTransactionsImported, currency }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string>('');

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        setIsLoading(true);
        toast.loading('Processing bank connection...', { id: 'bank-connection' });

        // Exchange public token for access token
        const accessToken = await exchangePublicToken(public_token);
        
        // Fetch transactions
        const transactions = await getTransactions(accessToken);
        
        // Convert to expense format
        const expenses: Expense[] = transactions.map(transaction => ({
          id: crypto.randomUUID(),
          amount: Math.abs(transaction.amount),
          quantity: 1,
          description: transaction.merchant_name || transaction.name || 'Bank Transaction',
          date: transaction.date,
          category: categorizeExpense(transaction.merchant_name || transaction.name || ''),
          currency: currency,
          source: 'bank'
        }));

        onTransactionsImported(expenses);
        setIsConnected(true);
        setConnectedAccount(metadata.institution?.name || 'Bank Account');
        
        toast.success(`Successfully imported ${expenses.length} transactions!`, { id: 'bank-connection' });
      } catch (error) {
        console.error('Error processing bank connection:', error);
        toast.error('Failed to import transactions. Please try again.', { id: 'bank-connection' });
      } finally {
        setIsLoading(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast.error('Bank connection was cancelled or failed.');
      }
    },
  });

  const handleConnectBank = async () => {
    try {
      setIsLoading(true);
      toast.loading('Preparing bank connection...', { id: 'link-token' });
      
      const token = await createLinkToken();
      setLinkToken(token);
      
      toast.dismiss('link-token');
      
      // Small delay to ensure token is set
      setTimeout(() => {
        if (token) {
          open();
        }
      }, 100);
    } catch (error) {
      console.error('Error creating link token:', error);
      toast.error('Failed to initialize bank connection. Please try again.', { id: 'link-token' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = () => {
    setIsConnected(false);
    setConnectedAccount('');
    setLinkToken(null);
    handleConnectBank();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 mr-4">
            <Banknote size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Bank Connection</h2>
        </div>

        {!isConnected ? (
          <div className="text-center py-8">
            <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <LinkIcon size={32} className="text-blue-500" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Connect Your Bank Account
            </h3>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Securely connect your bank account to automatically import transactions and keep your expenses up to date.
            </p>

            <button
              onClick={handleConnectBank}
              disabled={isLoading || !ready}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg flex items-center mx-auto"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <LinkIcon size={20} className="mr-2" />
                  Connect Bank Account
                </>
              )}
            </button>

            {/* Demo Notice */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                    Demo Mode
                  </h4>
                  <p className="text-sm text-yellow-700">
                    This uses Plaid's sandbox environment with fake data for demonstration purposes. 
                    No real bank accounts will be connected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-green-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Bank Account Connected
            </h3>
            
            <p className="text-gray-600 mb-6">
              Successfully connected to <span className="font-semibold">{connectedAccount}</span>
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleReconnect}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Import More Transactions
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <CheckCircle size={20} className="text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Secure Connection</h4>
            <p className="text-sm text-gray-600">Bank-level security with Plaid</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Banknote size={20} className="text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Auto Import</h4>
            <p className="text-sm text-gray-600">Latest transactions imported automatically</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <LinkIcon size={20} className="text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Smart Categorization</h4>
            <p className="text-sm text-gray-600">Transactions auto-categorized</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankConnection;