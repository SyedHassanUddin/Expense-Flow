// Mock Plaid API for sandbox/demo purposes
// In production, these would be actual API calls to your backend

interface PlaidTransaction {
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category: string[];
  transaction_id: string;
}

// Mock sandbox data
const MOCK_TRANSACTIONS: PlaidTransaction[] = [
  {
    account_id: 'acc_1',
    amount: 12.50,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Starbucks Coffee',
    merchant_name: 'Starbucks',
    category: ['Food and Drink', 'Restaurants', 'Coffee Shop'],
    transaction_id: 'txn_1'
  },
  {
    account_id: 'acc_1',
    amount: 45.20,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Uber Trip',
    merchant_name: 'Uber',
    category: ['Transportation', 'Taxi'],
    transaction_id: 'txn_2'
  },
  {
    account_id: 'acc_1',
    amount: 89.99,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Amazon Purchase',
    merchant_name: 'Amazon',
    category: ['Shops', 'Digital Purchase'],
    transaction_id: 'txn_3'
  },
  {
    account_id: 'acc_1',
    amount: 25.00,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Movie Theater',
    merchant_name: 'AMC Theaters',
    category: ['Recreation', 'Entertainment'],
    transaction_id: 'txn_4'
  },
  {
    account_id: 'acc_1',
    amount: 156.78,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Grocery Store',
    merchant_name: 'Whole Foods',
    category: ['Food and Drink', 'Groceries'],
    transaction_id: 'txn_5'
  },
  {
    account_id: 'acc_1',
    amount: 8.50,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Subway Sandwich',
    merchant_name: 'Subway',
    category: ['Food and Drink', 'Restaurants'],
    transaction_id: 'txn_6'
  },
  {
    account_id: 'acc_1',
    amount: 75.00,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Gas Station',
    merchant_name: 'Shell',
    category: ['Transportation', 'Gas Stations'],
    transaction_id: 'txn_7'
  },
  {
    account_id: 'acc_1',
    amount: 32.99,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Netflix Subscription',
    merchant_name: 'Netflix',
    category: ['Recreation', 'Entertainment'],
    transaction_id: 'txn_8'
  },
  {
    account_id: 'acc_1',
    amount: 120.00,
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Electric Bill',
    merchant_name: 'Electric Company',
    category: ['Payment', 'Utilities'],
    transaction_id: 'txn_9'
  },
  {
    account_id: 'acc_1',
    amount: 18.75,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Fast Food',
    merchant_name: 'McDonald\'s',
    category: ['Food and Drink', 'Restaurants'],
    transaction_id: 'txn_10'
  },
  {
    account_id: 'acc_1',
    amount: 65.00,
    date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Pharmacy',
    merchant_name: 'CVS Pharmacy',
    category: ['Shops', 'Pharmacies'],
    transaction_id: 'txn_11'
  },
  {
    account_id: 'acc_1',
    amount: 42.30,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Online Shopping',
    merchant_name: 'Target',
    category: ['Shops', 'General Merchandise'],
    transaction_id: 'txn_12'
  },
  {
    account_id: 'acc_1',
    amount: 15.99,
    date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Coffee Shop',
    merchant_name: 'Local Coffee',
    category: ['Food and Drink', 'Coffee Shop'],
    transaction_id: 'txn_13'
  },
  {
    account_id: 'acc_1',
    amount: 95.50,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Restaurant Dinner',
    merchant_name: 'Italian Restaurant',
    category: ['Food and Drink', 'Restaurants'],
    transaction_id: 'txn_14'
  },
  {
    account_id: 'acc_1',
    amount: 28.00,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Ride Share',
    merchant_name: 'Lyft',
    category: ['Transportation', 'Taxi'],
    transaction_id: 'txn_15'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function createLinkToken(): Promise<string> {
  // Simulate API call delay
  await delay(1000);
  
  // In a real app, this would call your backend to create a link token
  // For demo purposes, we'll return a mock token
  return 'link-sandbox-mock-token-' + Date.now();
}

export async function exchangePublicToken(publicToken: string): Promise<string> {
  // Simulate API call delay
  await delay(1500);
  
  // In a real app, this would exchange the public token for an access token
  // For demo purposes, we'll return a mock access token
  return 'access-sandbox-mock-token-' + Date.now();
}

export async function getTransactions(accessToken: string): Promise<PlaidTransaction[]> {
  // Simulate API call delay
  await delay(2000);
  
  // In a real app, this would fetch actual transactions from Plaid
  // For demo purposes, we'll return mock transactions
  
  // Randomize the number of transactions (10-20)
  const count = Math.floor(Math.random() * 11) + 10;
  const shuffled = [...MOCK_TRANSACTIONS].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, count);
}

// For production use, you would implement these functions to call your backend:

/*
export async function createLinkToken(): Promise<string> {
  const response = await fetch('/api/plaid/create-link-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to create link token');
  }
  
  const data = await response.json();
  return data.link_token;
}

export async function exchangePublicToken(publicToken: string): Promise<string> {
  const response = await fetch('/api/plaid/exchange-public-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_token: publicToken }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to exchange public token');
  }
  
  const data = await response.json();
  return data.access_token;
}

export async function getTransactions(accessToken: string): Promise<PlaidTransaction[]> {
  const response = await fetch('/api/plaid/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ access_token: accessToken }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  
  const data = await response.json();
  return data.transactions;
}
*/