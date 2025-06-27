import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import SummaryCards from './components/SummaryCards';
import ExpenseForm from './components/ExpenseForm';
import ReceiptScanner from './components/ReceiptScanner';
import ExpenseList from './components/ExpenseList';
import Filters from './components/Filters';
import Footer from './components/Footer';
import { Expense, Currency, TimeFilter, ExpenseFormData } from './types/expense';
import { loadExpenses, saveExpenses, exportToCSV } from './utils/storage';
import { categorizeExpense } from './utils/categories';
import { filterExpensesByTime } from './utils/dateFilters';

function App() {
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
      currency: currency
    };

    setExpenses(prev => [newExpense, ...prev]);
    
    // Clear OCR data after successful submission
    setOcrFormData({});
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

  // Filter expenses based on time and search
  const filteredExpenses = filterExpensesByTime(expenses, timeFilter);

  return (
    <div className="min-h-screen bg-gray-50">
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
        onCurrencyChange={setCurrency}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
        onClearAll={handleClearAll}
        expenseCount={expenses.length}
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
}

export default App;