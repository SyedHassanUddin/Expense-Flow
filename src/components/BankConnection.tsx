import React, { useState, useEffect } from 'react';
import { Banknote, Link as LinkIcon, CheckCircle, AlertCircle, Loader, Calendar, Tag, ArrowUpRight, CreditCard, Shield, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import { Expense, Currency } from '../types/expense';
import { categorizeExpense } from '../utils/categories';
import { createLinkToken, exchangePublicToken, getTransactions } from '../utils/plaidApi';
import { formatCurrency, formatDate } from '../utils/dateFilters';

interface BankConnectionProps {
  onTransactionsImported: (transactions: Expense[]) => void;
  currency: Currency;
}

interface BankTransaction {
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category: string[];
  transaction_id: string;
}

const BankConnection: React.FC<BankConnectionProps> = ({ onTransactionsImported, currency }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string>('');
  const [recentTransactions, setRecentTransactions] = useState<BankTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);

  // Load recent transactions when component mounts (simulate always having some bank data)
  useEffect(() => {
    const loadRecentTransactions = async () => {
      try {
        const transactions = await getTransactions('demo-access-token');
        setRecentTransactions(transactions.slice(0, 10)); // Show last 10 transactions
        setShowTransactions(true);
      } catch (error) {
        console.error('Error loading recent transactions:', error);
        toast.error('Failed to load demo transactions');
      }
    };

    loadRecentTransactions();
  }, []);

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

  const getCategoryColor = (categories: string[]) => {
    const category = categories[0]?.toLowerCase() || '';
    if (category.includes('food') || category.includes('restaurant')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (category.includes('transportation') || category.includes('gas')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (category.includes('shop') || category.includes('retail')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (category.includes('entertainment') || category.includes('recreation')) return 'bg-green-100 text-green-700 border-green-200';
    if (category.includes('utilities') || category.includes('payment')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 lg:p-8">
        {/* Demo Bank Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl">
            {/* Card Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-12 h-12 border-2 border-white rounded-full"></div>
              <div className="absolute top-8 right-8 w-8 h-8 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 border border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <CreditCard size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Demo Bank Card</h3>
                    <p className="text-white/80 text-sm">Sandbox Account</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi size={20} className="text-white/80" />
                  <Shield size={20} className="text-white/80" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider">Card Number</p>
                  <p className="text-xl font-mono">•••• •••• •••• 1234</p>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider">Valid Thru</p>
                    <p className="font-mono">12/28</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider">CVV</p>
                    <p className="font-mono">•••</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider">Balance</p>
                    <p className="font-semibold">{currency}25,430</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Connection Section */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 mr-4">
                <Banknote size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Bank Integration</h2>
            </div>

            {!isConnected ? (
              <div className="text-center">
                <div className="bg-blue-500/20 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-blue-400/30">
                  <LinkIcon size={28} className="text-blue-300" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4">
                  Connect Your Bank Account
                </h3>
                
                <p className="text-white/70 mb-6">
                  Import your recent transactions automatically. This demo uses realistic fake data to show how bank integration works.
                </p>

                <button
                  onClick={handleConnectBank}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg flex items-center mx-auto mb-6"
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
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle size={18} className="text-yellow-300 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-yellow-200 mb-1">
                        🎭 Demo Mode - Safe Testing
                      </h4>
                      <p className="text-sm text-yellow-300/80">
                        This simulates bank integration with fake transactions. No real bank accounts are connected!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-500/20 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-green-400/30">
                  <CheckCircle size={28} className="text-green-300" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  Bank Account Connected! 🎉
                </h3>
                
                <p className="text-white/70 mb-6">
                  Successfully connected to <span className="font-semibold text-white">{connectedAccount}</span>
                </p>

                <button
                  onClick={handleReconnect}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mb-6"
                >
                  Import More Transactions
                </button>

                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                  <p className="text-sm text-green-200">
                    ✅ Check your expense list below - the imported transactions should now appear with green "Bank Import" badges!
                  </p>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="bg-blue-500/20 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center border border-blue-400/30">
                  <CheckCircle size={16} className="text-blue-300" />
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">Secure</h4>
                <p className="text-xs text-white/60">Demo mode</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-500/20 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center border border-green-400/30">
                  <Banknote size={16} className="text-green-300" />
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">Auto Import</h4>
                <p className="text-xs text-white/60">10-20 transactions</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-500/20 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center border border-purple-400/30">
                  <Tag size={16} className="text-purple-300" />
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">Smart Tags</h4>
                <p className="text-xs text-white/60">Auto-categorized</p>
              </div>
            </div>
          </div>

          {/* Recent Bank Transactions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-3 mr-4">
                  <Calendar size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
              </div>
              <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Last 10
              </span>
            </div>

            {showTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {/* Scrollable container */}
                <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {recentTransactions.map((transaction, index) => (
                    <div
                      key={transaction.transaction_id}
                      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Transaction Icon */}
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-red-400/30">
                          <ArrowUpRight size={16} className="text-red-300" />
                        </div>
                        
                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {transaction.merchant_name || transaction.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(transaction.category)}`}>
                              {transaction.category[0] || 'Other'}
                            </span>
                            <span className="text-xs text-white/50">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-lg text-red-300">
                          -{formatCurrency(transaction.amount, currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Import All Button */}
                <div className="pt-4 border-t border-white/20">
                  <button
                    onClick={handleConnectBank}
                    disabled={isLoading || isConnected}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle size={20} className="mr-2" />
                        Transactions Imported
                      </>
                    ) : (
                      <>
                        <Banknote size={20} className="mr-2" />
                        Import All to Expense Tracker
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-white/40 mb-4">
                  <Calendar size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-white/60 mb-2">
                  Loading Bank Transactions...
                </h3>
                <p className="text-white/50">
                  Fetching your recent transaction history
                </p>
              </div>
            )}

            {/* Bank Account Info */}
            <div className="pt-6 border-t border-white/20">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                <div className="flex items-center">
                  <Banknote size={20} className="text-blue-300 mr-3" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-200">Demo Bank Account</h4>
                    <p className="text-sm text-blue-300/80">Checking Account •••• 1234</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankConnection;