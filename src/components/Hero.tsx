import React from 'react';
import { TrendingUp, Zap, Sparkles, Star, Database, Shield, Smartphone } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-20 px-4">
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-float"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-white/10 rounded-full animate-float-delay"></div>
      <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/15 rounded-full animate-float"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="glass-card dark:glass-card-dark rounded-full p-6 mr-6 glow-purple animate-float">
            <TrendingUp size={40} className="text-white" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold">
            <span className="gradient-text dark:gradient-text-dark">Expense</span>
            <span className="text-white/90">Flow</span>
          </h1>
        </div>
        
        <p className="text-xl lg:text-2xl mb-10 text-white/80 max-w-4xl mx-auto leading-relaxed">
          The smartest way to track expenses with <strong>voice commands</strong>, <strong>receipt scanning</strong>, 
          <strong> bank integration</strong>, and <strong>cloud sync</strong> across all your devices
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6 glow-blue hover:scale-105 transition-all duration-300">
            <Zap size={32} className="text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Voice Powered</h3>
            <p className="text-white/70 text-sm">
              Say "Pizza 200 rupees today" and watch it auto-fill amount, description, and date
            </p>
          </div>
          
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6 glow-green hover:scale-105 transition-all duration-300">
            <Sparkles size={32} className="text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Smart OCR</h3>
            <p className="text-white/70 text-sm">
              Snap receipts with camera or upload images - AI extracts amount, date, and items
            </p>
          </div>
          
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6 glow-purple hover:scale-105 transition-all duration-300">
            <Star size={32} className="text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Bank Sync</h3>
            <p className="text-white/70 text-sm">
              Import transactions automatically from your bank (demo mode with realistic data)
            </p>
          </div>
          
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6 glow-blue hover:scale-105 transition-all duration-300">
            <Database size={32} className="text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Cloud Storage</h3>
            <p className="text-white/70 text-sm">
              Sign up to sync expenses across devices. Works offline too with local storage
            </p>
          </div>
          
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6 glow-green hover:scale-105 transition-all duration-300">
            <Shield size={32} className="text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Privacy First</h3>
            <p className="text-white/70 text-sm">
              Your data is encrypted and secure. Use without account for complete privacy
            </p>
          </div>
          
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6 glow-purple hover:scale-105 transition-all duration-300">
            <Smartphone size={32} className="text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Mobile Ready</h3>
            <p className="text-white/70 text-sm">
              Responsive design works perfectly on phones, tablets, and desktops
            </p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="glass-card dark:glass-card-dark rounded-2xl p-8 text-left max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">🚀 Quick Start Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">📱 Add Expenses (3 Ways)</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• <strong>Voice:</strong> Click 🎤 and say "Coffee 50 rupees yesterday"</li>
                <li>• <strong>Camera:</strong> Click 📷 to snap receipt photos</li>
                <li>• <strong>Manual:</strong> Type in the + Add Expense form</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🔧 Advanced Features</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• <strong>Settings ⚙️:</strong> Change currency, time filters, export data</li>
                <li>• <strong>Search:</strong> Find expenses by description or category</li>
                <li>• <strong>Edit:</strong> Click ✏️ on any expense to modify</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🏦 Bank Integration</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• Demo mode shows realistic bank transactions</li>
                <li>• Import 10-20 transactions with one click</li>
                <li>• Auto-categorizes based on merchant names</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">☁️ Account Benefits</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• <strong>Sync:</strong> Access expenses on any device</li>
                <li>• <strong>Backup:</strong> Never lose your data</li>
                <li>• <strong>Migration:</strong> Existing data auto-transfers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 shimmer opacity-20 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Hero;