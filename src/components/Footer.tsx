import React from 'react';
import { Heart, TrendingUp, Github, Twitter, Mail, Shield, Database, Smartphone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-pink-50 to-blue-50 border-t-4 border-pink-200 mt-16 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mr-3">
                <TrendingUp size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-emerald-600">Expense</span>
                <span className="text-amber-500">Flow</span>
              </span>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed font-medium">
              The smartest way to track expenses with voice commands, receipt scanning, 
              bank integration, and cloud sync. Built with privacy and user experience in mind.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors">
                <Github size={20} className="text-gray-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-white rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors">
                <Twitter size={20} className="text-gray-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-white rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors">
                <Mail size={20} className="text-gray-600" />
              </a>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600 font-medium">
              <li>🎤 Voice Input</li>
              <li>📷 Receipt Scanning</li>
              <li>🏦 Bank Integration</li>
              <li>☁️ Cloud Sync</li>
              <li>📊 Smart Analytics</li>
              <li>💱 Multi-Currency</li>
            </ul>
          </div>
          
          {/* Technology */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Technology</h3>
            <ul className="space-y-2 text-gray-600 font-medium">
              <li>⚛️ React + TypeScript</li>
              <li>🎨 Tailwind CSS</li>
              <li>🗄️ Supabase Database</li>
              <li>🔊 Web Speech API</li>
              <li>📸 Tesseract.js OCR</li>
              <li>📱 PWA Ready</li>
            </ul>
          </div>
        </div>
        
        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="notebook-card p-6 text-center soft-hover">
            <Shield size={32} className="text-green-500 mx-auto mb-3" />
            <h4 className="font-bold text-gray-800 mb-2">Privacy First</h4>
            <p className="text-gray-600 text-sm font-medium">
              Your data is encrypted and secure. Use without account for complete privacy.
            </p>
          </div>
          
          <div className="notebook-card p-6 text-center soft-hover">
            <Database size={32} className="text-blue-500 mx-auto mb-3" />
            <h4 className="font-bold text-gray-800 mb-2">Smart Storage</h4>
            <p className="text-gray-600 text-sm font-medium">
              Works offline with localStorage, sync across devices with cloud storage.
            </p>
          </div>
          
          <div className="notebook-card p-6 text-center soft-hover">
            <Smartphone size={32} className="text-purple-500 mx-auto mb-3" />
            <h4 className="font-bold text-gray-800 mb-2">Mobile First</h4>
            <p className="text-gray-600 text-sm font-medium">
              Responsive design optimized for mobile, tablet, and desktop usage.
            </p>
          </div>
        </div>
        
        {/* Usage Stats */}
        <div className="notebook-card p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">How Users Track Expenses</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-500 mb-2">45%</div>
              <div className="text-gray-600 font-medium">Voice Input</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500 mb-2">30%</div>
              <div className="text-gray-600 font-medium">Manual Entry</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500 mb-2">15%</div>
              <div className="text-gray-600 font-medium">Receipt Scan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">10%</div>
              <div className="text-gray-600 font-medium">Bank Import</div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t-2 border-pink-200">
          <div className="flex items-center text-gray-700 mb-4 md:mb-0 font-medium">
            <span>Made with</span>
            <Heart size={16} className="mx-2 text-red-500" />
            <span>for better financial tracking</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-lg font-bold text-emerald-600 mb-2">
              "Track today. Relax tomorrow."
            </p>
            <p className="text-sm text-gray-500 mb-1 font-medium">
              © 2024 ExpenseFlow. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              Open source • Privacy focused • User friendly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;