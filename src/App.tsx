import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import SummaryCards from './components/SummaryCards';
import ExpenseList from './components/ExpenseList';
import IncomeList from './components/IncomeList';
import BankConnection from './components/BankConnection';
import IncomeExpenseDashboard from './components/IncomeExpenseDashboard';
import BudgetOverview from './components/BudgetOverview';
import FloatingAddButton from './components/FloatingAddButton';
import FloatingMiniNavbar from './components/FloatingMiniNavbar';
import AddExpenseModal from './components/modals/AddExpenseModal';
import EditExpenseModal from './components/modals/EditExpenseModal';
import AddIncomeModal from './components/modals/AddIncomeModal';
import EditIncomeModal from './components/modals/EditIncomeModal';
import BudgetModal from './components/modals/BudgetModal';
import AuthModal from './components/auth/AuthModal';
import ReminderWidget from './components/ReminderWidget';
import FeatureGuide from './components/FeatureGuide';
import Footer from './components/Footer';
import ConnectionStatus from './components/ConnectionStatus';
import { Expense, Currency, TimeFilter, ExpenseFormData } from './types/expense';
import { Income, IncomeFormData } from './types/income';
import { Budget, BudgetFormData, BudgetStatus } from './types/budget';
import { loadExpenses, saveExpenses, exportToCSV } from './utils/storage';
import { loadIncome, saveIncome, exportIncomeToCSV } from './utils/incomeStorage';
import { loadBudgets, saveBudgets, exportBudgetsToCSV } from './utils/budgetStorage';
import { ExpenseDatabase } from './lib/database';
import { IncomeDatabase } from './lib/incomeDatabase';
import { BudgetDatabase } from './lib/budgetDatabase';
import { categorizeExpense } from './utils/categories';
import { filterExpensesByTime } from './utils/dateFilters';
import { calculateBudgetStatus, getCurrentMonth, shouldShowBudgetAlert, getBudgetAlertMessage } from './utils/budgetUtils';
import toast from 'react-hot-toast';

// Main App Component
const MainApp = () => {
  const { user, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currency, setCurrency] = useState<Currency>('₹');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [ocrFormData, setOcrFormData] = useState<Partial<ExpenseFormData>>({});
  const [loading, setLoading] = useState(true);
  const [showAddAnimation, setShowAddAnimation] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'expenses' | 'income' | 'budgets'>('dashboard');
  
  // Modal states
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Calculate budget statuses
  const budgetStatuses: BudgetStatus[] = calculateBudgetStatus(budgets, expenses, selectedMonth);

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

  // Load data on mount and when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (authLoading) return;
      
      setLoading(true);
      
      try {
        if (user) {
          // User is authenticated, load from database
          const [dbExpenses, dbIncome, dbBudgets] = await Promise.all([
            ExpenseDatabase.getExpenses(),
            IncomeDatabase.getIncome(),
            BudgetDatabase.getBudgets()
          ]);
          
          setExpenses(dbExpenses);
          setIncome(dbIncome);
          setBudgets(dbBudgets);
          
          // Migrate localStorage data if exists
          const [localExpenses, localIncome, localBudgets] = [
            loadExpenses(),
            loadIncome(),
            loadBudgets()
          ];
          
          if (localExpenses.length > 0 || localIncome.length > 0 || localBudgets.length > 0) {
            try {
              // Migrate expenses
              if (localExpenses.length > 0) {
                await ExpenseDatabase.importExpenses(localExpenses.map(exp => ({
                  amount: exp.amount,
                  quantity: exp.quantity,
                  description: exp.description,
                  date: exp.date,
                  category: exp.category,
                  currency: exp.currency,
                  source: exp.source || 'manual'
                })));
                localStorage.removeItem('expenseflow-expenses');
              }
              
              // Migrate income
              if (localIncome.length > 0) {
                for (const inc of localIncome) {
                  await IncomeDatabase.addIncome({
                    amount: inc.amount,
                    source: inc.source,
                    date: inc.date,
                    currency: inc.currency,
                    is_recurring: inc.is_recurring,
                    recurring_frequency: inc.recurring_frequency
                  });
                }
                localStorage.removeItem('expenseflow-income');
              }
              
              // Migrate budgets
              if (localBudgets.length > 0) {
                for (const budget of localBudgets) {
                  await BudgetDatabase.setBudget({
                    category: budget.category,
                    amount: budget.amount,
                    month: budget.month,
                    currency: budget.currency
                  });
                }
                localStorage.removeItem('expenseflow-budgets');
              }
              
              // Reload data to include migrated items
              const [updatedExpenses, updatedIncome, updatedBudgets] = await Promise.all([
                ExpenseDatabase.getExpenses(),
                IncomeDatabase.getIncome(),
                BudgetDatabase.getBudgets()
              ]);
              
              setExpenses(updatedExpenses);
              setIncome(updatedIncome);
              setBudgets(updatedBudgets);
              
              toast.success('Local data migrated to your account! 🎉');
            } catch (error) {
              console.error('Migration failed:', error);
            }
          }
        } else {
          // User not authenticated, load from localStorage
          setExpenses(loadExpenses());
          setIncome(loadIncome());
          setBudgets(loadBudgets());
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
        
        // Fallback to localStorage
        setExpenses(loadExpenses());
        setIncome(loadIncome());
        setBudgets(loadBudgets());
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, authLoading]);

  // Save data to localStorage when not authenticated
  useEffect(() => {
    if (!user) {
      if (expenses.length > 0) saveExpenses(expenses);
      if (income.length > 0) saveIncome(income);
      if (budgets.length > 0) saveBudgets(budgets);
    }
  }, [expenses, income, budgets, user]);

  // Budget alerts
  useEffect(() => {
    budgetStatuses.forEach(status => {
      if (shouldShowBudgetAlert(status)) {
        const message = getBudgetAlertMessage(status);
        if (status.isOverBudget) {
          toast.error(message, { duration: 6000 });
        } else {
          toast(message, { 
            icon: '🔔',
            duration: 5000,
            style: {
              background: 'rgba(251, 191, 36, 0.9)',
              color: 'white'
            }
          });
        }
      }
    });
  }, [budgetStatuses]);

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

  const handleAddIncome = async (formData: IncomeFormData) => {
    const newIncome = {
      amount: parseFloat(formData.amount),
      source: formData.source,
      date: formData.date,
      currency: currency,
      is_recurring: formData.is_recurring,
      recurring_frequency: formData.recurring_frequency
    };

    try {
      if (user) {
        // Save to database
        const savedIncome = await IncomeDatabase.addIncome(newIncome);
        setIncome(prev => [savedIncome, ...prev]);
      } else {
        // Save to localStorage
        const incomeWithId: Income = {
          id: crypto.randomUUID(),
          ...newIncome
        };
        setIncome(prev => [incomeWithId, ...prev]);
      }
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income');
    }
  };

  const handleEditIncome = async (updatedIncome: Income) => {
    try {
      if (user) {
        // Update in database
        await IncomeDatabase.updateIncome(updatedIncome);
        setIncome(prev => 
          prev.map(inc => 
            inc.id === updatedIncome.id ? updatedIncome : inc
          )
        );
      } else {
        // Update in localStorage
        setIncome(prev => 
          prev.map(inc => 
            inc.id === updatedIncome.id ? updatedIncome : inc
          )
        );
      }
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('Failed to update income');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    const incomeItem = income.find(i => i.id === id);
    if (!incomeItem) return;

    try {
      if (user) {
        // Delete from database
        await IncomeDatabase.deleteIncome(id);
        setIncome(prev => prev.filter(inc => inc.id !== id));
      } else {
        // Delete from localStorage
        setIncome(prev => prev.filter(inc => inc.id !== id));
      }
      
      toast.success(`Deleted income from "${incomeItem.source}" 🗑️`);
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Failed to delete income');
    }
  };

  const handleSetBudget = async (formData: BudgetFormData) => {
    const budgetData = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      month: formData.month,
      currency: currency
    };

    try {
      if (user) {
        // Save to database
        const savedBudget = await BudgetDatabase.setBudget(budgetData);
        setBudgets(prev => {
          const filtered = prev.filter(b => !(b.category === savedBudget.category && b.month === savedBudget.month));
          return [savedBudget, ...filtered];
        });
      } else {
        // Save to localStorage
        const budgetWithId: Budget = {
          id: crypto.randomUUID(),
          ...budgetData
        };
        setBudgets(prev => {
          const filtered = prev.filter(b => !(b.category === budgetWithId.category && b.month === budgetWithId.month));
          return [budgetWithId, ...filtered];
        });
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      toast.error('Failed to set budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;

    try {
      if (user) {
        // Delete from database
        await BudgetDatabase.deleteBudget(id);
        setBudgets(prev => prev.filter(b => b.id !== id));
      } else {
        // Delete from localStorage
        setBudgets(prev => prev.filter(b => b.id !== id));
      }
      
      toast.success(`Deleted budget for "${budget.category}" 🗑️`);
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
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

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      return;
    }

    try {
      if (user) {
        // Clear from database
        await Promise.all([
          ExpenseDatabase.deleteAllExpenses(),
          IncomeDatabase.deleteAllIncome(),
          BudgetDatabase.deleteAllBudgets()
        ]);
        setExpenses([]);
        setIncome([]);
        setBudgets([]);
      } else {
        // Clear from localStorage
        setExpenses([]);
        setIncome([]);
        setBudgets([]);
        localStorage.removeItem('expenseflow-expenses');
        localStorage.removeItem('expenseflow-income');
        localStorage.removeItem('expenseflow-budgets');
      }
      
      toast.success('All data cleared! 🧹');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
    }
  };

  const handleExport = () => {
    const filteredExpenses = filterExpensesByTime(expenses, timeFilter);
    const monthIncome = income.filter(inc => inc.date.substring(0, 7) === selectedMonth);
    const monthBudgets = budgets.filter(budget => budget.month === selectedMonth);
    
    exportToCSV(filteredExpenses, `expenses-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`);
    if (monthIncome.length > 0) {
      exportIncomeToCSV(monthIncome, `income-${selectedMonth}.csv`);
    }
    if (monthBudgets.length > 0) {
      exportBudgetsToCSV(monthBudgets, `budgets-${selectedMonth}.csv`);
    }
    
    toast.success('Data exported successfully! 📊');
  };

  const handleOCRDataExtracted = (data: Partial<ExpenseFormData>) => {
    setOcrFormData(data);
    setIsAddExpenseModalOpen(true); // Auto-open modal with OCR data
  };

  const handleCurrencyChange = async (newCurrency: Currency) => {
    if (newCurrency === currency) return;
    
    setCurrency(newCurrency);
    toast.success(`Currency changed to ${newCurrency} 💱`);
  };

  const handleOpenEditExpenseModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditExpenseModalOpen(true);
  };

  const handleOpenEditIncomeModal = (income: Income) => {
    setEditingIncome(income);
    setIsEditIncomeModalOpen(true);
  };

  const handleOpenEditBudgetModal = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  const handleOpenAddExpenseModal = () => {
    setIsAddExpenseModalOpen(true);
    setShowAddAnimation(false); // Hide animation when user clicks
  };

  // Filter expenses based on time and search
  const filteredExpenses = filterExpensesByTime(expenses, timeFilter);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen animated-bg dark:animated-bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading your financial data...</p>
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
      
      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex space-x-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentView === 'dashboard'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentView('expenses')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentView === 'expenses'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              💸 Expenses
            </button>
            <button
              onClick={() => setCurrentView('income')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentView === 'income'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              💰 Income
            </button>
            <button
              onClick={() => setCurrentView('budgets')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentView === 'budgets'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🎯 Budgets
            </button>
          </div>
        </div>
      </div>

      {/* Content based on current view */}
      {currentView === 'dashboard' && (
        <>
          <IncomeExpenseDashboard
            expenses={expenses}
            income={income}
            budgetStatuses={budgetStatuses}
            currency={currency}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
          
          <SummaryCards 
            expenses={filteredExpenses}
            currency={currency}
            timeFilter={timeFilter}
          />
        </>
      )}

      {currentView === 'expenses' && (
        <>
          <ExpenseList
            expenses={filteredExpenses}
            currency={currency}
            onDelete={handleDeleteExpense}
            onEdit={handleOpenEditExpenseModal}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddExpense={handleOpenAddExpenseModal}
          />
          
          <BankConnection 
            onTransactionsImported={handleBankTransactions}
            currency={currency}
          />
        </>
      )}

      {currentView === 'income' && (
        <IncomeList
          income={income}
          currency={currency}
          onDelete={handleDeleteIncome}
          onEdit={handleOpenEditIncomeModal}
          onAddIncome={() => setIsAddIncomeModalOpen(true)}
        />
      )}

      {currentView === 'budgets' && (
        <BudgetOverview
          budgets={budgets}
          budgetStatuses={budgetStatuses}
          currency={currency}
          selectedMonth={selectedMonth}
          onEditBudget={handleOpenEditBudgetModal}
          onDeleteBudget={handleDeleteBudget}
          onAddBudget={() => setIsBudgetModalOpen(true)}
        />
      )}
      
      <ReminderWidget onAddExpense={handleOpenAddExpenseModal} />
      
      {/* Feature Guide moved to end before footer */}
      <FeatureGuide />
      
      <Footer />
      
      {/* Floating Controls */}
      <FloatingAddButton 
        onClick={handleOpenAddExpenseModal}
        showAnimation={showAddAnimation}
      />
      
      <FloatingMiniNavbar
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onExport={handleExport}
        onClearAll={handleClearAll}
        expenseCount={expenses.length + income.length + budgets.length}
      />
      
      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          setOcrFormData({});
        }}
        onSubmit={handleAddExpense}
        currency={currency}
        initialData={ocrFormData}
      />
      
      <EditExpenseModal
        isOpen={isEditExpenseModalOpen}
        onClose={() => {
          setIsEditExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleEditExpense}
        expense={editingExpense}
        currency={currency}
      />

      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        onSubmit={handleAddIncome}
        currency={currency}
      />

      <EditIncomeModal
        isOpen={isEditIncomeModalOpen}
        onClose={() => {
          setIsEditIncomeModalOpen(false);
          setEditingIncome(null);
        }}
        onSave={handleEditIncome}
        income={editingIncome}
        currency={currency}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={editingBudget ? 
          (data) => handleSetBudget({ ...data, category: editingBudget.category }) : 
          handleSetBudget
        }
        currency={currency}
        initialData={editingBudget ? {
          category: editingBudget.category,
          amount: editingBudget.amount.toString(),
          month: editingBudget.month
        } : undefined}
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