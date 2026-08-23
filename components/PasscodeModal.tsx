
import React, { useState } from 'react';
import { ArrowLeftIcon, CircleXIcon } from './Icons';

interface PasscodeModalProps {
  onVerify: (code: string) => boolean;
  onClose: () => void;
  title?: string;
  accentColor: string;
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ onVerify, onClose, title = "Enter Secret Code", accentColor }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const triggerHaptic = (ms: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const handleNumber = (num: string) => {
    if (code.length < 6) {
      triggerHaptic(10);
      const newCode = code + num;
      setCode(newCode);
      setError(false);
      
      if (newCode.length === 6) {
        setTimeout(() => {
          if (onVerify(newCode)) {
            triggerHaptic(50);
          } else {
            triggerHaptic([50, 50, 50]);
            setError(true);
            setCode('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic(10);
    setCode(code.slice(0, -1));
    setError(false);
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="passcode-modal theme-page fixed inset-0 z-100 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-xs flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-10 left-6 p-3 bg-zinc-900 rounded-2xl active:scale-90 transition-transform"
        >
          <ArrowLeftIcon />
        </button>

        <h2 className={`text-xl font-black mb-8 uppercase tracking-widest transition-colors ${error ? 'text-red-500' : 'text-zinc-500'}`}>
          {error ? 'Wrong Code' : title}
        </h2>

        {/* Code Visualizer */}
        <div className={`flex gap-4 mb-12 ${error ? 'animate-bounce' : ''}`}>
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < code.length 
                  ? 'scale-125' 
                  : 'bg-transparent border-zinc-800'
              }`}
              style={i < code.length ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
            />
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="passcode-keypad grid grid-cols-3 w-full">
          {numbers.map(num => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="passcode-key rounded-full bg-zinc-900 flex items-center justify-center font-black transition-colors"
            >
              {num}
            </button>
          ))}
          <div /> {/* Spacer */}
          <button
            onClick={() => handleNumber('0')}
            className="passcode-key rounded-full bg-zinc-900 flex items-center justify-center font-black transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="passcode-key rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 active:text-red-500 transition-colors"
            aria-label="Delete last digit"
          >
            <CircleXIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasscodeModal;
