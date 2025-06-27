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