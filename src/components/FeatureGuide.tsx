import React, { useState } from 'react';
import { 
  Mic, Camera, Upload, Banknote, Settings, Search, Edit, 
  Trash2, Download, User, ChevronDown, ChevronUp, 
  Play, Pause, Volume2, Eye, EyeOff 
} from 'lucide-react';

const FeatureGuide: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const features = [
    {
      id: 'voice',
      icon: <Mic size={24} className="text-purple-500" />,
      title: 'Voice Input Magic 🎤',
      description: 'Speak naturally and watch ExpenseFlow understand',
      examples: [
        '"Pizza 200 rupees today" → Amount: 200, Description: Pizza, Date: Today',
        '"Bought groceries for 150 dollars yesterday" → Amount: 150, Description: Groceries, Date: Yesterday',
        '"Movie tickets 300 rupees 2 quantity last Friday" → Amount: 300, Quantity: 2, Date: Last Friday',
        '"On June 15th, paid electricity bill of 500" → Amount: 500, Description: Electricity bill, Date: June 15',
        '"Uber ride 80 rupees" → Amount: 80, Description: Uber ride, Date: Today (default)'
      ],
      tips: [
        'Speak clearly and include amount with currency',
        'Mention dates like "today", "yesterday", "last Monday", or specific dates',
        'Include quantity for multiple items: "2 coffee cups"',
        'Works with multiple currencies: rupees, dollars, euros, pounds'
      ]
    },
    {
      id: 'camera',
      icon: <Camera size={24} className="text-green-500" />,
      title: 'Smart Receipt Scanning 📷',
      description: 'AI-powered OCR extracts data from receipts instantly',
      examples: [
        'Take photo of restaurant bill → Auto-extracts total amount and date',
        'Grocery receipt → Identifies items, total, and store name',
        'Gas station receipt → Captures amount, date, and merchant',
        'Coffee shop receipt → Extracts price and recognizes coffee purchase'
      ],
      tips: [
        'Ensure receipt is well-lit and flat',
        'Keep text in focus and avoid shadows',
        'Works with printed receipts, not handwritten ones',
        'Supports JPG, PNG, WebP formats up to 10MB'
      ]
    },
    {
      id: 'bank',
      icon: <Banknote size={24} className="text-blue-500" />,
      title: 'Bank Integration Demo 🏦',
      description: 'Experience realistic bank transaction imports',
      examples: [
        'Import 10-20 realistic transactions with one click',
        'Auto-categorizes: Starbucks → Food & Dining',
        'Recognizes merchants: Uber → Transportation',
        'Includes transaction dates and amounts'
      ],
      tips: [
        'Demo mode uses fake but realistic data',
        'Shows how real bank integration would work',
        'Transactions are auto-categorized intelligently',
        'Safe to test - no real bank accounts connected'
      ]
    },
    {
      id: 'account',
      icon: <User size={24} className="text-orange-500" />,
      title: 'Account & Sync ☁️',
      description: 'Optional cloud storage for cross-device access',
      examples: [
        'Sign up → Existing localStorage data auto-migrates',
        'Access expenses from phone, tablet, and computer',
        'Data backed up securely in Supabase database',
        'Works offline too - syncs when back online'
      ],
      tips: [
        'No account needed - works with localStorage',
        'Create account anytime to enable sync',
        'Existing data is preserved during migration',
        'Email verification required for security'
      ]
    },
    {
      id: 'features',
      icon: <Settings size={24} className="text-gray-500" />,
      title: 'Advanced Features ⚙️',
      description: 'Powerful tools for expense management',
      examples: [
        'Search expenses by description or category',
        'Edit any expense with ✏️ button',
        'Export data to CSV for analysis',
        'Change currency with real-time conversion',
        'Filter by time: today, week, month, all time'
      ],
      tips: [
        'Settings ⚙️ dropdown contains advanced options',
        'Real-time search filters as you type',
        'Currency conversion uses live exchange rates',
        'CSV export includes all expense details'
      ]
    }
  ];

  if (!isVisible) {
    return (
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <button
          onClick={() => setIsVisible(true)}
          className="glass-card dark:glass-card-dark px-4 py-2 rounded-xl text-white/80 hover:text-white transition-colors"
        >
          <Eye size={16} className="inline mr-2" />
          Show Feature Guide
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 mb-12">
      <div className="glass-card dark:glass-card-dark rounded-2xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">📚 How to Use ExpenseFlow</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            title="Hide guide"
          >
            <EyeOff size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(feature.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {feature.icon}
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-white/70 text-sm">{feature.description}</p>
                  </div>
                </div>
                {expandedSection === feature.id ? (
                  <ChevronUp size={20} className="text-white/70" />
                ) : (
                  <ChevronDown size={20} className="text-white/70" />
                )}
              </button>
              
              {expandedSection === feature.id && (
                <div className="px-4 pb-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">✨ Examples:</h4>
                    <ul className="space-y-1">
                      {feature.examples.map((example, index) => (
                        <li key={index} className="text-white/80 text-sm pl-4 border-l-2 border-white/20">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">💡 Tips:</h4>
                    <ul className="space-y-1">
                      {feature.tips.map((tip, index) => (
                        <li key={index} className="text-white/80 text-sm pl-4 border-l-2 border-green-400/30">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-white/20">
          <h3 className="font-semibold text-white mb-2">🎯 Pro Tips for Best Experience:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80">
            <div>• Use voice input for quick entries on mobile</div>
            <div>• Scan receipts immediately after purchases</div>
            <div>• Create account to sync across devices</div>
            <div>• Export data monthly for budgeting</div>
            <div>• Use search to find specific expenses</div>
            <div>• Try bank demo to see auto-categorization</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGuide;