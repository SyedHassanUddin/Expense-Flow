import React from 'react';
import { TrendingUp, Mic, Calendar } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-16 px-4">
      {/* Floating decorative shapes */}
      <div className="floating-shape w-20 h-20 bg-pink-200 top-10 left-10"></div>
      <div className="floating-shape w-16 h-16 bg-yellow-200 top-32 right-20"></div>
      <div className="floating-shape w-12 h-12 bg-green-200 bottom-20 left-1/4"></div>
      <div className="floating-shape w-24 h-24 bg-blue-200 top-1/2 right-1/3"></div>
      <div className="floating-shape w-8 h-8 bg-orange-200 bottom-32 right-10"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Main Title with Bounce Animation */}
        <div className="bounce-in mb-8">
          <h1 className="text-6xl lg:text-8xl font-bold mb-4">
            <span className="text-emerald-600">Expenses</span>
            <br />
            <span className="text-amber-500">Flow</span>
          </h1>
        </div>
        
        <p className="text-xl lg:text-2xl mb-12 text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
          "Track your daily expenses with smart voice inputs.<br />
          Instant categorization and beautiful analytics."
        </p>
        
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Voice Input Card */}
          <div className="notebook-card p-8 soft-hover">
            <div className="voice-section">
              <div className="flex items-center mb-6">
                <div className="character-illustration mr-4"></div>
                <div className="flex space-x-1">
                  <div className="voice-wave w-1 h-8 bg-emerald-500 rounded-full"></div>
                  <div className="voice-wave w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <div className="voice-wave w-1 h-10 bg-emerald-500 rounded-full"></div>
                  <div className="voice-wave w-1 h-4 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-emerald-700 mb-4">Voice Input</h3>
              
              <div className="bg-white rounded-2xl p-4 mb-4 border-2 border-emerald-200">
                <p className="text-gray-700 font-medium">User speaks:</p>
                <p className="text-emerald-600 font-bold text-lg">
                  "Pizza of 100 rupees of 5 quantity on June 10"
                </p>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Tech Used:</strong> SpeechRecognition API</p>
                <p>(webkitSpeechRecognition fallback)</p>
                <p>NLP regex parsing to extract structured info from natural phrases</p>
              </div>
            </div>
          </div>

          {/* Chart Analytics Card */}
          <div className="notebook-card p-8 soft-hover">
            <div className="chart-container">
              <h3 className="text-2xl font-bold text-pink-600 mb-6">Chart Analytics</h3>
              
              {/* Pastel Donut Chart Placeholder */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-8 border-pink-200"></div>
                <div className="absolute inset-2 rounded-full border-6 border-green-200"></div>
                <div className="absolute inset-4 rounded-full border-4 border-yellow-200"></div>
                <div className="absolute inset-6 rounded-full border-2 border-blue-200"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700">Pans</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Displays category-wise spendings in a donut chart<br />
                Filters available: daily, weekly, monthly
              </p>
              
              <p className="text-sm text-gray-500 font-medium">
                <strong>Tech Used:</strong> Chart.js
              </p>
            </div>
          </div>

          {/* CSV Export Card */}
          <div className="notebook-card p-8 soft-hover">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-600 rounded-t-2xl h-1/2"></div>
                <div className="relative z-10">
                  <div className="text-white text-2xl mb-1">📄</div>
                  <div className="text-white text-lg">↓</div>
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
                  CSV
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-emerald-600 mb-4">CSV Export</h3>
              
              <p className="text-gray-600 mb-6">
                Single click to download all expenses in CSV format.
              </p>
              
              <button className="csv-button button-glow micro-bounce">
                <span>📄</span>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Currency Switcher */}
          <div className="notebook-card p-8 soft-hover">
            <h3 className="text-2xl font-bold text-blue-600 mb-6">Currency Switcher</h3>
            
            <p className="text-gray-600 mb-6">
              Change currency symbol dynamically (USD, INR, etc.)
            </p>
            
            <div className="flex justify-center space-x-2">
              <button className="currency-pill active micro-bounce">$</button>
              <button className="currency-pill micro-bounce">₹</button>
              <button className="currency-pill micro-bounce">€</button>
              <span className="text-emerald-600 text-xl">▼</span>
            </div>
          </div>

          {/* Smart Date Autofill */}
          <div className="notebook-card p-8 soft-hover">
            <h3 className="text-2xl font-bold text-orange-600 mb-6">Smart Date Autofill</h3>
            
            <p className="text-gray-600 mb-6">
              Sets today's date automatically on app load
            </p>
            
            <div className="flex justify-center">
              <div className="date-badge">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-emerald-700">24</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Footer */}
        <div className="mt-16 p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-3xl border-2 border-pink-200">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Built with modern web technologies
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="bg-white px-3 py-1 rounded-full border border-pink-200">React + TypeScript</span>
            <span className="bg-white px-3 py-1 rounded-full border border-blue-200">Tailwind CSS</span>
            <span className="bg-white px-3 py-1 rounded-full border border-green-200">Chart.js</span>
            <span className="bg-white px-3 py-1 rounded-full border border-yellow-200">Speech API</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;