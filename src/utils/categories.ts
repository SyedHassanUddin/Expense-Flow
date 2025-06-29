export const categoryKeywords: Record<string, string[]> = {
  'Food & Dining': [
    'pizza', 'burger', 'food', 'restaurant', 'lunch', 'dinner', 'breakfast',
    'coffee', 'tea', 'snack', 'meal', 'eat', 'hungry', 'dine', 'cafe',
    'kitchen', 'cooking', 'recipe', 'grocery', 'market', 'bread', 'milk'
  ],
  'Transportation': [
    'uber', 'taxi', 'bus', 'train', 'metro', 'fuel', 'gas', 'petrol',
    'auto', 'rickshaw', 'travel', 'transport', 'ticket', 'fare', 'ride'
  ],
  'Shopping': [
    'clothes', 'shirt', 'shoes', 'dress', 'shopping', 'mall', 'store',
    'buy', 'purchase', 'amazon', 'flipkart', 'online', 'delivery'
  ],
  'Entertainment': [
    'movie', 'cinema', 'theater', 'game', 'music', 'concert', 'party',
    'fun', 'entertainment', 'netflix', 'youtube', 'streaming'
  ],
  'Healthcare': [
    'doctor', 'medicine', 'hospital', 'pharmacy', 'health', 'medical',
    'clinic', 'checkup', 'treatment', 'pills', 'prescription'
  ],
  'Utilities': [
    'electricity', 'water', 'gas', 'internet', 'phone', 'mobile',
    'bill', 'utility', 'wifi', 'broadband', 'recharge'
  ],
  'Education': [
    'book', 'course', 'class', 'school', 'college', 'university',
    'education', 'learn', 'study', 'tuition', 'fee'
  ],
  'Other': []
};

// Default categories that are always available
export const defaultCategories = [
  'Food & Dining',
  'Transportation', 
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Education',
  'Other'
];

// Get custom categories from localStorage
export function getCustomCategories(): string[] {
  try {
    const stored = localStorage.getItem('expenseflow-custom-categories');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load custom categories:', error);
    return [];
  }
}

// Save custom categories to localStorage
export function saveCustomCategories(categories: string[]): void {
  try {
    localStorage.setItem('expenseflow-custom-categories', JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save custom categories:', error);
  }
}

// Add a new custom category
export function addCustomCategory(category: string): boolean {
  const trimmed = category.trim();
  if (!trimmed || trimmed.length > 30) return false;
  
  const allCategories = getAllCategories();
  if (allCategories.some(cat => cat.toLowerCase() === trimmed.toLowerCase())) {
    return false; // Category already exists
  }
  
  const customCategories = getCustomCategories();
  const newCustomCategories = [...customCategories, trimmed];
  saveCustomCategories(newCustomCategories);
  return true;
}

// Get all categories (default + custom)
export function getAllCategories(): string[] {
  const customCategories = getCustomCategories();
  return [...defaultCategories, ...customCategories];
}

// Remove a custom category
export function removeCustomCategory(category: string): void {
  if (defaultCategories.includes(category)) return; // Can't remove default categories
  
  const customCategories = getCustomCategories();
  const filtered = customCategories.filter(cat => cat !== category);
  saveCustomCategories(filtered);
}

export function categorizeExpense(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'Other') continue;
    
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Other';
}

export const categoryColors: Record<string, string> = {
  'Food & Dining': '#FF6B6B',
  'Transportation': '#4ECDC4',
  'Shopping': '#45B7D1',
  'Entertainment': '#96CEB4',
  'Healthcare': '#FFEAA7',
  'Utilities': '#DDA0DD',
  'Education': '#98D8C8',
  'Other': '#95A5A6'
};

// Get color for any category (including custom ones)
export function getCategoryColor(category: string): string {
  if (categoryColors[category]) {
    return categoryColors[category];
  }
  
  // Generate a consistent color for custom categories based on category name
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12', '#E74C3C', '#9B59B6'];
  const hash = category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}