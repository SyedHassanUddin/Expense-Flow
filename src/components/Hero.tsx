import React from 'react';
import { TrendingUp, Zap, Sparkles, Star } from 'lucide-react';

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
          Track your daily expenses with smart voice input, instant categorization, 
          and beautiful analytics in a stunning glassmorphism interface
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm lg:text-base">
          <div className="flex items-center glass-card dark:glass-card-dark rounded-full px-6 py-3 glow-blue">
            <Zap size={18} className="mr-2 text-yellow-400" />
            <span className="text-white/90">Voice Powered</span>
          </div>
          <div className="flex items-center glass-card dark:glass-card-dark rounded-full px-6 py-3 glow-green">
            <Sparkles size={18} className="mr-2 text-green-400" />
            <span className="text-white/90">Smart Analytics</span>
          </div>
          <div className="flex items-center glass-card dark:glass-card-dark rounded-full px-6 py-3 glow-purple">
            <Star size={18} className="mr-2 text-purple-400" />
            <span className="text-white/90">Bank Integration</span>
          </div>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 shimmer opacity-20 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Hero;