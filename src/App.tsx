import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import SummaryCards from './components/SummaryCards';
import ExpenseList from './components/ExpenseList';
import Footer from './components/Footer';
import BankConnection from './components/BankConnection';
import FloatingAddButton from './components/FloatingAddButton';
import AddExpenseModal from './components/modals/AddExpenseModal';
import EditExpenseModal from './components/modals/EditExpenseModal';
import ReminderWidget from './components/ReminderWidget';
import { Expense, Currency, TimeFilter, ExpenseFormData } from './types/expense';
import { loadExpenses, saveExpenses, exportToCSV } from './utils/storage';
import { categorizeExpense } from './utils/categories';
import { filterExpensesByTime } from './utils/dateFilters';
import toast from 'react-hot-toast';

// Main App Component
const MainApp = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currency, setCurrency] = useState<Currency>('₹');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ocrFormData, setOcrFormData] = useState<Partial<ExpenseFormData>>({});
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Load expenses on mount
  useEffect(() => {
    const loadedExpenses = loadExpenses();
    setExpenses(loadedExpenses);
  }, []);

  // Save expenses whenever they change
  useEffect(() => {
    if (expenses.length > 0) {
      saveExpenses(expenses);
    }
  }, [expenses]);

  const handleAddExpense = (formData: ExpenseFormData & { source?: string }) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(formData.amount),
      quantity: parseInt(formData.quantity),
      description: formData.description,
      date: formData.date,
      category: categorizeExpense(formData.description),
      currency: currency,
      source: formData.source || 'manual'
    };

    setExpenses(prev => [newExpense, ...prev]);
    
    // Clear OCR data after successful submission
    setOcrFormData({});
  };

  const handleEditExpense = (updatedExpense: Expense) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
  };

  const handleBankTransactions = (transactions: Expense[]) => {
    setExpenses(prev => [...transactions, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success(`Deleted "${expense.description}" 🗑️`);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
      setExpenses([]);
      localStorage.removeItem('expenseflow-expenses');
      toast.success('All expenses cleared! 🧹');
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

  // Handle currency change - convert existing expenses
  const handleCurrencyChange = async (newCurrency: Currency) => {
    if (newCurrency === currency) return;
    
    setCurrency(newCurrency);
    toast.success(`Currency changed to ${newCurrency} 💱`);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  // Filter expenses based on time and search
  const filteredExpenses = filterExpensesByTime(expenses, timeFilter);

  return (
    <div className="min-h-screen animated-bg dark:animated-bg-dark relative overflow-hidden">
      {/* Floating particles */}
      <div className="particle w-4 h-4 bg-white/20 top-10 left-10"></div>
      <div className="particle w-6 h-6 bg-white/10 top-32 right-20"></div>
      <div className="particle w-3 h-3 bg-white/15 bottom-20 left-1/4"></div>
      <div className="particle w-5 h-5 bg-white/10 top-1/2 right-1/3"></div>
      <div className="particle w-2 h-2 bg-white/20 bottom-32 right-10"></div>

      <Header 
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onExport={handleExport}
        onClearAll={handleClearAll}
        expenseCount={expenses.length}
      />
      
      <Hero />
      
      <SummaryCards 
        expenses={filteredExpenses}
        currency={currency}
        timeFilter={timeFilter}
      />
      
      <ReminderWidget onAddExpense={() => setIsAddModalOpen(true)} />
      
      <BankConnection 
        onTransactionsImported={handleBankTransactions}
        currency={currency}
      />
      
      <ExpenseList
        expenses={filteredExpenses}
        currency={currency}
        onDelete={handleDeleteExpense}
        onEdit={handleOpenEditModal}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddExpense={() => setIsAddModalOpen(true)}
      />
      
      <Footer />
      
      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setIsAddModalOpen(true)} />
      
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
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;