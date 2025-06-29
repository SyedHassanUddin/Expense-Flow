import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddExpenseModal from './components/modals/AddExpenseModal';
import EditExpenseModal from './components/modals/EditExpenseModal';
import AuthModal from './components/auth/AuthModal';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  const handleAddExpense = async (formData: ExpenseFormData & { source?: string }) => {
    const newExpense = {
      amount: parseFloat(formData.amount),
      quantity: parseInt(formData.quantity),
      description: formData.description,
      date: formData.date,
      category: categorizeExpense(formData.description),
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

  // Filter expenses based on time and search
  const filteredExpenses = filterExpensesByTime(expenses, timeFilter);

  if (authLoading || loading) {
    return (
      <div className="app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddExpense={() => setIsAddModalOpen(true)}
      />
      
      <div className="main-content">
        <Header 
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          onExport={handleExport}
          onClearAll={handleClearAll}
          expenseCount={expenses.length}
          user={user}
          onAuthRequired={handleAuthRequired}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <Dashboard
          expenses={filteredExpenses}
          currency={currency}
          timeFilter={timeFilter}
          onDelete={handleDeleteExpense}
          onEdit={handleOpenEditModal}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddExpense={() => setIsAddModalOpen(true)}
          onBankTransactions={handleBankTransactions}
        />
      </div>
      
      {/* Floating Add Button */}
      <button 
        className="floating-add"
        onClick={() => setIsAddModalOpen(true)}
        aria-label="Add new expense"
      >
        +
      </button>
      
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
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              color: '#1E293B',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: '500',
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