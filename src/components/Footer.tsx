import React from 'react';
import { Heart, TrendingUp, Github, Twitter, Mail, Shield, Database, Smartphone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-16 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <TrendingUp size={24} className="text-blue-400 mr-2" />
              <span className="text-xl font-bold text-white">ExpenseFlow</span>
            </div>
            
            <p className="text-white/70 mb-4 leading-relaxed">
              The smartest way to track expenses with voice commands, receipt scanning, 
              bank integration, and cloud sync. Built with privacy and user experience in mind.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
            <ul className="space-y-2 text-white/70">
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
            <h3 className="text-lg font-semibold text-white mb-4">Technology</h3>
            <ul className="space-y-2 text-white/70">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-center">
            <Shield size={32} className="text-green-400 mx-auto mb-3" />
            <h4 className="font-semibold text-white mb-2">Privacy First</h4>
            <p className="text-white/70 text-sm">
              Your data is encrypted and secure. Use without account for complete privacy.
            </p>
          </div>
          
          <div className="text-center">
            <Database size={32} className="text-blue-400 mx-auto mb-3" />
            <h4 className="font-semibold text-white mb-2">Smart Storage</h4>
            <p className="text-white/70 text-sm">
              Works offline with localStorage, sync across devices with cloud storage.
            </p>
          </div>
          
          <div className="text-center">
            <Smartphone size={32} className="text-purple-400 mx-auto mb-3" />
            <h4 className="font-semibold text-white mb-2">Mobile First</h4>
            <p className="text-white/70 text-sm">
              Responsive design optimized for mobile, tablet, and desktop usage.
            </p>
          </div>
        </div>
        
        {/* Usage Stats */}
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">How Users Track Expenses</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-blue-400">45%</div>
              <div className="text-white/70">Voice Input</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">30%</div>
              <div className="text-white/70">Manual Entry</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">15%</div>
              <div className="text-white/70">Receipt Scan</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">10%</div>
              <div className="text-white/70">Bank Import</div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/20">
          <div className="flex items-center text-white/70 mb-4 md:mb-0">
            <span>Made with</span>
            <Heart size={16} className="mx-2 text-red-400" />
            <span>for better financial tracking</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-white/50 mb-1">
              © 2024 ExpenseFlow. All rights reserved.
            </p>
            <p className="text-xs text-white/40">
              Open source • Privacy focused • User friendly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;