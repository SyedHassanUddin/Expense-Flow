import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { startVoiceRecognition, VoiceResult } from '../utils/voiceRecognition';
import toast from 'react-hot-toast';

interface VoiceInputProps {
  onAddExpense: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onAddExpense }) => {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (isListening) return;

    startVoiceRecognition(
      (result: VoiceResult) => {
        console.log('Voice result:', result);
        toast.success('Voice input captured! Opening form...');
        onAddExpense();
      },
      (error: string) => {
        toast.error(error);
      },
      () => setIsListening(true),
      () => setIsListening(false)
    );
  };

  return (
    <div className="modern-card p-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Voice Input</h3>
        
        {/* Character Illustration */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center relative">
            <span className="text-2xl">🗣️</span>
            {isListening && (
              <div className="absolute -right-2 flex space-x-1">
                <div className="w-1 h-6 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-8 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Voice Button */}
        <button
          onClick={handleVoiceInput}
          disabled={isListening}
          className={`voice-button ${isListening ? 'listening' : ''} mb-4`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Example Text */}
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <div className="text-sm text-slate-600 mb-1">User speaks:</div>
          <div className="text-sm font-semibold text-slate-800">
            "Pizza of 100 rupees of 5 quantity on June 10"
          </div>
        </div>

        {/* Tech Info */}
        <div className="text-xs text-slate-500 space-y-1">
          <div><strong>Tech Used:</strong> SpeechRecognition API</div>
          <div>(webkitSpeechRecognition fallback)</div>
          <div>NLP regex parsing to extract structured info from natural phrases</div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;