import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-500 to-blue-900 text-white py-16 px-4">
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-white/10 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-700"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mr-4">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold">
            Expense<span className="text-yellow-200">Flow</span>
          </h1>
        </div>
        
        <p className="text-xl lg:text-2xl mb-8 text-yellow-100 max-w-3xl mx-auto leading-relaxed">
          Track your daily expenses with smart voice input, instant categorization, and beautiful analytics
        </p>
        
        <div className="flex items-center justify-center space-x-6 text-sm lg:text-base">
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Zap size={16} className="mr-2" />
            Voice Powered
          </div>
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <TrendingUp size={16} className="mr-2" />
            Smart Analytics
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;