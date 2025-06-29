import React, { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string>('');

  // Mock Plaid Link flow - completely simulated
  const handleConnectBank = async () => {
    try {
      setIsLoading(true);
      toast.loading('Connecting to bank...', { id: 'bank-connection' });

      // Simulate the entire Plaid flow with mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate link token creation
      
      toast.loading('Opening bank selection...', { id: 'bank-connection' });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate user bank selection
      
      toast.loading('Authenticating...', { id: 'bank-connection' });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate authentication
      
      toast.loading('Fetching transactions...', { id: 'bank-connection' });
      
      // Get mock transactions
      const transactions = await getTransactions('mock-access-token');
      
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
      setConnectedAccount('Demo Bank (Sandbox)');
      
      toast.success(`Successfully imported ${expenses.length} transactions from your bank!`, { 
        id: 'bank-connection',
        duration: 4000
      });
    } catch (error) {
      console.error('Error processing bank connection:', error);
      toast.error('Failed to import transactions. Please try again.', { id: 'bank-connection' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = () => {
    setIsConnected(false);
    setConnectedAccount('');
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
              Import your recent transactions automatically. This demo uses fake data to show how bank integration works.
            </p>

            <button
              onClick={handleConnectBank}
              disabled={isLoading}
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
                  Connect Bank Account (Demo)
                </>
              )}
            </button>

            {/* Demo Notice */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                    🎭 Demo Mode - No Real Bank Connection
                  </h4>
                  <p className="text-sm text-yellow-700">
                    This simulates bank integration with 10-20 fake transactions (Starbucks, Uber, Amazon, etc.). 
                    No real bank accounts are connected - it's completely safe to test!
                  </p>
                </div>
              </div>
            </div>

            {/* Preview of what you'll get */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                📊 Sample Transactions You'll Import:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div>• Starbucks Coffee - $12.50</div>
                <div>• Uber Trip - $45.20</div>
                <div>• Amazon Purchase - $89.99</div>
                <div>• Movie Theater - $25.00</div>
                <div>• Grocery Store - $156.78</div>
                <div>• And 10+ more realistic transactions...</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-green-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Bank Account Connected! 🎉
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

            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700">
                ✅ Check your expense list below - the imported transactions should now appear with green "Bank Import" badges!
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <CheckCircle size={20} className="text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Secure & Safe</h4>
            <p className="text-sm text-gray-600">Demo mode - no real data used</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Banknote size={20} className="text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Auto Import</h4>
            <p className="text-sm text-gray-600">10-20 realistic transactions</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <LinkIcon size={20} className="text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Smart Categories</h4>
            <p className="text-sm text-gray-600">Auto-categorized by merchant</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankConnection;