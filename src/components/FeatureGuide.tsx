import React, { useState } from 'react';
import { 
  Mic, Camera, Upload, Banknote, Settings, Search, Edit, 
  Trash2, Download, User, ChevronDown, ChevronUp, 
  Play, Pause, Volume2, Eye, EyeOff, Smartphone, Zap, 
  Sparkles, Star, Database, Shield, PieChart, Calendar,
  BarChart3, Plus, CheckCircle, Tag
} from 'lucide-react';

const FeatureGuide: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const quickStartSteps = [
    {
      id: 'add-expenses',
      icon: <Plus size={20} className="text-blue-400" />,
      title: '📱 Add Expenses (3 Ways)',
      items: [
        '🎤 Voice: Click microphone and say "Coffee 50 rupees yesterday"',
        '📷 Camera: Click camera to snap receipt photos',
        '✏️ Manual: Type in the + Add Expense form',
        '🏷️ Categories: Auto-detected or create custom ones'
      ]
    },
    {
      id: 'advanced-features',
      icon: <Settings size={20} className="text-purple-400" />,
      title: '🔧 Advanced Features',
      items: [
        '⚙️ Settings: Change currency, time filters, export data',
        '🔍 Search: Find expenses by description or category',
        '✏️ Edit: Click edit button on any expense to modify',
        '📊 Analytics: View spending breakdown and trends'
      ]
    },
    {
      id: 'bank-integration',
      icon: <Banknote size={20} className="text-green-400" />,
      title: '🏦 Bank Integration',
      items: [
        '🎭 Demo mode shows realistic bank transactions',
        '📥 Import 10-20 transactions with one click',
        '🤖 Auto-categorizes based on merchant names',
        '🔒 Safe testing - no real bank accounts connected'
      ]
    },
    {
      id: 'account-benefits',
      icon: <User size={20} className="text-orange-400" />,
      title: '☁️ Account Benefits',
      items: [
        '🔄 Sync: Access expenses on any device',
        '💾 Backup: Never lose your data',
        '📱 Migration: Existing data auto-transfers',
        '🔐 Security: Email verification required'
      ]
    }
  ];

  const detailedFeatures = [
    {
      id: 'voice',
      icon: <Mic size={20} className="text-purple-500" />,
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
      icon: <Camera size={20} className="text-green-500" />,
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
      icon: <Banknote size={20} className="text-blue-500" />,
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
      icon: <User size={20} className="text-orange-500" />,
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
      icon: <Settings size={20} className="text-gray-500" />,
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
          Show User Guide
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 mb-12">
      <div className="glass-card dark:glass-card-dark rounded-2xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">📚 Complete User Guide</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            title="Hide guide"
          >
            <EyeOff size={20} />
          </button>
        </div>

        {/* Quick Start Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 mr-3">
              <Zap size={20} className="text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">🚀 Quick Start Guide</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {quickStartSteps.map((step) => (
              <div key={step.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center mb-3">
                  {step.icon}
                  <h4 className="font-semibold text-white text-sm sm:text-base ml-2">{step.title}</h4>
                </div>
                <ul className="space-y-1">
                  {step.items.map((item, index) => (
                    <li key={index} className="text-white/80 text-xs sm:text-sm pl-2 border-l-2 border-white/20">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Key Features Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Zap size={24} className="text-yellow-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-xs sm:text-sm">Voice Powered</h4>
              <p className="text-white/60 text-xs">Smart recognition</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Sparkles size={24} className="text-green-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-xs sm:text-sm">Smart OCR</h4>
              <p className="text-white/60 text-xs">Receipt scanning</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Star size={24} className="text-purple-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-xs sm:text-sm">Bank Sync</h4>
              <p className="text-white/60 text-xs">Auto import</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Database size={24} className="text-blue-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-xs sm:text-sm">Cloud Storage</h4>
              <p className="text-white/60 text-xs">Cross-device sync</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Shield size={24} className="text-green-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-xs sm:text-sm">Privacy First</h4>
              <p className="text-white/60 text-xs">Secure & encrypted</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Smartphone size={24} className="text-purple-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-xs sm:text-sm">Mobile Ready</h4>
              <p className="text-white/60 text-xs">Responsive design</p>
            </div>
          </div>
        </div>

        {/* Detailed Features Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-full p-2 mr-3">
              <Settings size={20} className="text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">🔧 Detailed Features</h3>
          </div>
          
          <div className="space-y-3">
            {detailedFeatures.map((feature) => (
              <div key={feature.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                <button
                  onClick={() => toggleSection(feature.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <div className="text-left">
                      <h4 className="font-semibold text-white text-sm sm:text-base">{feature.title}</h4>
                      <p className="text-white/70 text-xs sm:text-sm">{feature.description}</p>
                    </div>
                  </div>
                  {expandedSection === feature.id ? (
                    <ChevronUp size={20} className="text-white/70 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-white/70 flex-shrink-0" />
                  )}
                </button>
                
                {expandedSection === feature.id && (
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <h5 className="font-medium text-white mb-2 text-sm">✨ Examples:</h5>
                      <div className="space-y-1 max-h-32 sm:max-h-none overflow-y-auto">
                        {feature.examples.map((example, index) => (
                          <div key={index} className="text-white/80 text-xs sm:text-sm pl-3 border-l-2 border-white/20 bg-white/5 rounded-r-lg p-2">
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-white mb-2 text-sm">💡 Tips:</h5>
                      <div className="space-y-1 max-h-32 sm:max-h-none overflow-y-auto">
                        {feature.tips.map((tip, index) => (
                          <div key={index} className="text-white/80 text-xs sm:text-sm pl-3 border-l-2 border-green-400/30 bg-green-500/10 rounded-r-lg p-2">
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Pro Tips Section */}
        <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-white/20">
          <h3 className="font-semibold text-white mb-3 flex items-center">
            <Star size={20} className="text-yellow-400 mr-2" />
            🎯 Pro Tips for Best Experience
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-white/80">
            <div className="flex items-center">
              <CheckCircle size={14} className="text-green-400 mr-2 flex-shrink-0" />
              Use voice input for quick entries on mobile
            </div>
            <div className="flex items-center">
              <CheckCircle size={14} className="text-green-400 mr-2 flex-shrink-0" />
              Scan receipts immediately after purchases
            </div>
            <div className="flex items-center">
              <CheckCircle size={14} className="text-green-400 mr-2 flex-shrink-0" />
              Create account to sync across devices
            </div>
            <div className="flex items-center">
              <CheckCircle size={14} className="text-green-400 mr-2 flex-shrink-0" />
              Export data monthly for budgeting
            </div>
            <div className="flex items-center">
              <CheckCircle size={14} className="text-green-400 mr-2 flex-shrink-0" />
              Use search to find specific expenses
            </div>
            <div className="flex items-center">
              <CheckCircle size={14} className="text-green-400 mr-2 flex-shrink-0" />
              Try bank demo to see auto-categorization
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-white/20">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 text-center">📊 How Users Track Expenses</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">45%</div>
              <div className="text-white/70 text-xs sm:text-sm">Voice Input</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xl sm:text-2xl font-bold text-green-400">30%</div>
              <div className="text-white/70 text-xs sm:text-sm">Manual Entry</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">15%</div>
              <div className="text-white/70 text-xs sm:text-sm">Receipt Scan</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">10%</div>
              <div className="text-white/70 text-xs sm:text-sm">Bank Import</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGuide;