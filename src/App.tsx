import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import SummaryCards from './components/SummaryCards';
import ExpenseList from './components/ExpenseList';
import BankConnection from './components/BankConnection';
import FloatingAddButton from './components/FloatingAddButton';
import FloatingMiniNavbar from './components/FloatingMiniNavbar';
import AddExpenseModal from './components/modals/AddExpenseModal';
import EditExpenseModal from './components/modals/EditExpenseModal';
import AuthModal from './components/auth/AuthModal';
import ReminderWidget from './components/ReminderWidget';
import FeatureGuide from './components/FeatureGuide';
import Footer from './components/Footer';
import ConnectionStatus from './components/ConnectionStatus';
import { Expense, Currency, TimeFilter, ExpenseFormData } from './types/expense';
import { loadExpenses, saveExpenses, exportToCSV } from './utils/storage';
import { ExpenseDatabase } from './lib/database';
import { categorizeExpense } from './utils/categories';
import { filterExpensesByTime } from './utils/dateFilters';
import toast from 'react-hot-toast';

// Main App Component
const MainApp = () => {
  const { user, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currency, setCurrency] = useState<Currency>('₹');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ocrFormData, setOcrFormData] = useState<Partial<ExpenseFormData>>({});
  const [loading, setLoading] = useState(true);
  const [showAddAnimation, setShowAddAnimation] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Show add button animation for new users
  useEffect(() => {
    const hasSeenAnimation = localStorage.getItem('expenseflow-seen-add-animation');
    if (!hasSeenAnimation && expenses.length === 0) {
      const timer = setTimeout(() => {
        setShowAddAnimation(true);
        // Hide animation after 5 seconds
        setTimeout(() => {
          setShowAddAnimation(false);
          localStorage.setItem('expenseflow-seen-add-animation', 'true');
        }, 5000);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [expenses.length]);

  // Load expenses on mount and when user changes
  useEffect(() => {
    const loadUserExpenses = async () => {
      if (authLoading) return;
      
      setLoading(true);
      
      try {
        if (user) {
          // User is authenticated, load from database
          const dbExpenses = await ExpenseDatabase.getExpenses();
          setExpenses(dbExpenses);
          
          // Migrate localStorage data if exists
          const localExpenses = loadExpenses();
          if (localExpenses.length > 0) {
            try {
              await ExpenseDatabase.importExpenses(localExpenses.map(exp => ({
                amount: exp.amount,
                quantity: exp.quantity,
                description: exp.description,
                date: exp.date,
                category: exp.category,
                currency: exp.currency,
                source: exp.source || 'manual'
              })));
              
              // Clear localStorage after successful migration
              localStorage.removeItem('expenseflow-expenses');
              
              // Reload expenses to include migrated data
              const updatedExpenses = await ExpenseDatabase.getExpenses();
              setExpenses(updatedExpenses);
              
              toast.success('Local expenses migrated to your account! 🎉');
            } catch (error) {
              console.error('Migration failed:', error);
            }
          }
        } else {
          // User not authenticated, load from localStorage
          const localExpenses = loadExpenses();
          setExpenses(localExpenses);
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
        toast.error('Failed to load expenses');
        
        // Fallback to localStorage
        const localExpenses = loadExpenses();
        setExpenses(localExpenses);
      } finally {
        setLoading(false);
      }
    };

    loadUserExpenses();
  }, [user, authLoading]);

  // Save expenses to localStorage when not authenticated
  useEffect(() => {
    if (!user && expenses.length > 0) {
      saveExpenses(expenses);
    }
  }, [expenses, user]);

  const handleAddExpense = async (formData: ExpenseFormData & { source?: string; category?: string }) => {
    const newExpense = {
      amount: parseFloat(formData.amount),
      quantity: parseInt(formData.quantity),
      description: formData.description,
      date: formData.date,
      category: formData.category || categorizeExpense(formData.description),
      currency: currency,
      source: formData.source || 'manual'
    };

    try {
      if (user) {
        // Save to database
        const savedExpense = await ExpenseDatabase.addExpense(newExpense);
        setExpenses(prev => [savedExpense, ...prev]);
      } else {
        // Save to localStorage
        const expenseWithId: Expense = {
          id: crypto.randomUUID(),
          ...newExpense
        };
        setExpenses(prev => [expenseWithId, ...prev]);
      }
      
      // Clear OCR data after successful submission
      setOcrFormData({});
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleEditExpense = async (updatedExpense: Expense) => {
    try {
      if (user) {
        // Update in database
        await ExpenseDatabase.updateExpense(updatedExpense);
        setExpenses(prev => 
          prev.map(expense => 
            expense.id === updatedExpense.id ? updatedExpense : expense
          )
        );
      } else {
        // Update in localStorage
        setExpenses(prev => 
          prev.map(expense => 
            expense.id === updatedExpense.id ? updatedExpense : expense
          )
        );
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    }
  };

  const handleBankTransactions = async (transactions: Expense[]) => {
    try {
      if (user) {
        // Save to database
        const transactionsWithoutId = transactions.map(({ id, ...rest }) => rest);
        const savedTransactions = await ExpenseDatabase.importExpenses(transactionsWithoutId);
        setExpenses(prev => [...savedTransactions, ...prev]);
      } else {
        // Save to localStorage
        setExpenses(prev => [...transactions, ...prev]);
      }
    } catch (error) {
      console.error('Error importing transactions:', error);
      toast.error('Failed to import transactions');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    try {
      if (user) {
        // Delete from database
        await ExpenseDatabase.deleteExpense(id);
        setExpenses(prev => prev.filter(expense => expense.id !== id));
      } else {
        // Delete from localStorage
        setExpenses(prev => prev.filter(expense => expense.id !== id));
      }
      
      toast.success(`Deleted "${expense.description}" 🗑️`);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
      return;
    }

    try {
      if (user) {
        // Clear from database
        await ExpenseDatabase.deleteAllExpenses();
        setExpenses([]);
      } else {
        // Clear from localStorage
        setExpenses([]);
        localStorage.removeItem('expenseflow-expenses');
      }
      
      toast.success('All expenses cleared! 🧹');
    } catch (error) {
      console.error('Error clearing expenses:', error);
      toast.error('Failed to clear expenses');
    }
  };

  const handleExport = () => {
    const filteredExpenses = filterExpensesByTime(expenses, timeFilter);
    exportToCSV(filteredExpenses, `expenses-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Expenses exported successfully! 📊');
  };

  const handleOCRDataExtracted = (data: Partial<ExpenseFormData>) => {
    setOcrFormData(data);
    setIsAddModalOpen(true); // Auto-open modal with OCR data
  };

  const handleCurrencyChange = async (newCurrency: Currency) => {
    if (newCurrency === currency) return;
    
    setCurrency(newCurrency);
    toast.success(`Currency changed to ${newCurrency} 💱`);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setShowAddAnimation(false); // Hide animation when user clicks
  };

  // Filter expenses based on time and search
  const filteredExpenses = filterExpensesByTime(expenses, timeFilter);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen animated-bg dark:animated-bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg dark:animated-bg-dark relative overflow-hidden">
      {/* Floating particles */}
      <div className="particle w-4 h-4 bg-white/20 top-10 left-10"></div>
      <div className="particle w-6 h-6 bg-white/10 top-32 right-20"></div>
      <div className="particle w-3 h-3 bg-white/15 bottom-20 left-1/4"></div>
      <div className="particle w-5 h-5 bg-white/10 top-1/2 right-1/3"></div>
      <div className="particle w-2 h-2 bg-white/20 bottom-32 right-10"></div>

      {/* Connection Status */}
      <ConnectionStatus />

      <Header 
        user={user}
        onAuthRequired={handleAuthRequired}
      />
      
      <Hero />
      
      <SummaryCards 
        expenses={filteredExpenses}
        currency={currency}
        timeFilter={timeFilter}
      />
      
      <ReminderWidget onAddExpense={handleOpenAddModal} />
      
      <ExpenseList
        expenses={filteredExpenses}
        currency={currency}
        onDelete={handleDeleteExpense}
        onEdit={handleOpenEditModal}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddExpense={handleOpenAddModal}
      />
      
      <BankConnection 
        onTransactionsImported={handleBankTransactions}
        currency={currency}
      />
      
      {/* Feature Guide moved to end before footer */}
      <FeatureGuide />
      
      <Footer />
      
      {/* Floating Controls */}
      <FloatingAddButton 
        onClick={handleOpenAddModal}
        showAnimation={showAddAnimation}
      />
      
      <FloatingMiniNavbar
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onExport={handleExport}
        onClearAll={handleClearAll}
        expenseCount={expenses.length}
      />
      
      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setOcrFormData({});
        }}
        onSubmit={handleAddExpense}
        currency={currency}
        initialData={ocrFormData}
      />
      
      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleEditExpense}
        expense={editingExpense}
        currency={currency}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainApp />} />
          </Routes>
        </Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#333',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;