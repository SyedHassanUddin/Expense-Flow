import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import Header from './components/Header';
import Hero from './components/Hero';
import SummaryCards from './components/SummaryCards';
import ExpenseForm from './components/ExpenseForm';
import ReceiptScanner from './components/ReceiptScanner';
import ExpenseList from './components/ExpenseList';
import Filters from './components/Filters';
import Footer from './components/Footer';
import BankConnection from './components/BankConnection';
import { Expense, Currency, TimeFilter, ExpenseFormData } from './types/expense';
import { loadExpenses, saveExpenses, exportToCSV } from './utils/storage';
import { categorizeExpense } from './utils/categories';
import { filterExpensesByTime } from './utils/dateFilters';

// Main App Component
const MainApp = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currency, setCurrency] = useState<Currency>('₹');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ocrFormData, setOcrFormData] = useState<Partial<ExpenseFormData>>({});

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

  const handleAddExpense = (formData: ExpenseFormData) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(formData.amount),
      quantity: parseInt(formData.quantity),
      description: formData.description,
      date: formData.date,
      category: categorizeExpense(formData.description),
      currency: currency,
      source: 'manual'
    };

    setExpenses(prev => [newExpense, ...prev]);
    
    // Clear OCR data after successful submission
    setOcrFormData({});
  };

  const handleBankTransactions = (transactions: Expense[]) => {
    setExpenses(prev => [...transactions, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
      setExpenses([]);
      localStorage.removeItem('expenseflow-expenses');
    }
  };

  const handleExport = () => {
    const filteredExpenses = filterExpensesByTime(expenses, timeFilter);
    exportToCSV(filteredExpenses, `expenses-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleOCRDataExtracted = (data: Partial<ExpenseFormData>) => {
    setOcrFormData(data);
  };

  // Handle currency change - convert existing expenses
  const handleCurrencyChange = async (newCurrency: Currency) => {
    if (newCurrency === currency) return;
    
    setCurrency(newCurrency);
    
    // Note: The conversion will be handled by SummaryCards component
    // We don't need to convert the stored expenses, just display them converted
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

      <Header />
      <Hero />
      
      <SummaryCards 
        expenses={filteredExpenses}
        currency={currency}
        timeFilter={timeFilter}
      />
      
      <Filters
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
        onClearAll={handleClearAll}
        expenseCount={expenses.length}
      />
      
      <BankConnection 
        onTransactionsImported={handleBankTransactions}
        currency={currency}
      />
      
      <ExpenseForm 
        onSubmit={handleAddExpense}
        currency={currency}
        initialData={ocrFormData}
      />
      
      <ReceiptScanner 
        onDataExtracted={handleOCRDataExtracted}
      />
      
      <ExpenseList
        expenses={filteredExpenses}
        currency={currency}
        onDelete={handleDeleteExpense}
        searchTerm={searchTerm}
      />
      
      <Footer />
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
      <Toaster />
    </ThemeProvider>
  );
}

export default App;