
import React, { useState, useEffect, useRef } from 'react';
import { VisioCard } from '../types';
import { FlipIcon, ArrowLeftIcon, LockIcon, EditIcon } from './Icons';

interface FullscreenViewerProps {
  card: VisioCard;
  onClose: () => void;
  onEdit: (card: VisioCard) => void;
  initialFontSize: number;
  accentColor: string;
  displayTextColor: string;
}

const FullscreenViewer: React.FC<FullscreenViewerProps> = ({ card, onClose, onEdit, initialFontSize, accentColor, displayTextColor }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [isRevealed, setIsRevealed] = useState(!card.isSensitive);
  const [showUI, setShowUI] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  const triggerHaptic = (ms: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const startHideTimer = () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setShowUI(false);
    }, 5000);
  };

  const resetHideTimer = () => {
    setShowUI(true);
    startHideTimer();
  };

  useEffect(() => {
    startHideTimer();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(20);
    setIsFlipped(!isFlipped);
    resetHideTimer();
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(50);
    setIsRevealed(true);
    resetHideTimer();
  };

  const handleBackgroundClick = () => {
    if (!showUI) {
      resetHideTimer();
    } else {
      setShowUI(false);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.clientY <= 120 && !showUI) {
      resetHideTimer();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden animate-in fade-in duration-300"
      onClick={handleBackgroundClick}
      onMouseMove={handleMouseMove}
    >
      {/* Top Header Overlay - Fades out completely including gradient background */}
      <div 
        className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-30 bg-gradient-to-b from-black via-black/80 to-transparent transition-all duration-700 ease-in-out ${
          showUI ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="fullscreen-top-control w-12 h-12 text-white flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Close"
        >
          <ArrowLeftIcon size={28} />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(card); }} 
            className="fullscreen-top-control w-12 h-12 text-white flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Edit"
          >
            <EditIcon size={28} />
          </button>
          <button 
            onClick={handleFlip} 
            className="fullscreen-top-control w-12 h-12 text-white flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Flip text"
          >
            <FlipIcon size={28} />
          </button>
        </div>
      </div>

      {/* Main Content Area - Occupies full screen always */}
      <div className={`absolute inset-0 overflow-y-auto flex flex-col px-8 transition-all duration-500 ease-out ${isFlipped ? 'rotate-180' : ''}`}>
        {!isRevealed ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="w-32 h-32 bg-zinc-900 rounded-[48px] flex items-center justify-center text-zinc-600">
              <LockIcon />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Sensitive Info</h2>
              <p className="text-zinc-500 font-bold text-sm max-w-[200px]">This card contains personal or medical details.</p>
            </div>
            <button 
              onClick={handleReveal}
              className="px-10 py-5 bg-white text-black rounded-3xl font-black text-lg active:scale-95 transition-transform"
            >
              REVEAL CONTENT
            </button>
          </div>
        ) : (
          <div 
            className="w-full my-auto py-40 font-black text-center break-words leading-[1.15] tracking-tight whitespace-pre-wrap px-4"
            style={{ fontSize: `${fontSize}px`, color: displayTextColor }}
          >
            {card.content}
          </div>
        )}
      </div>

      {/* Bottom Font Controller Overlay - Fades out completely including gradient background */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-30 p-8 pb-10 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center gap-3 transition-all duration-700 ease-in-out ${
          showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <div 
          className="flex items-center gap-5 w-full max-w-[300px] scale-90 sm:scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-black text-zinc-600 uppercase">A</span>
          <div className="relative flex-1 group">
            <input 
              type="range" 
              min="24" 
              max="160" 
              step="4"
              value={fontSize} 
              onMouseDown={resetHideTimer}
              onTouchStart={resetHideTimer}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (Math.abs(val - fontSize) >= 4) triggerHaptic(5);
                setFontSize(val);
                resetHideTimer();
              }}
              className="w-full h-2.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-current overflow-hidden border border-zinc-800"
              style={{ color: accentColor }}
              aria-label="Adjust font size"
            />
          </div>
          <span className="text-xl font-black text-zinc-400 uppercase">A</span>
        </div>
        <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em]">Adjust Legibility</div>
      </div>
      
      {/* Tap indicator hint when UI is hidden */}
      {!showUI && isRevealed && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-zinc-800 uppercase tracking-widest pointer-events-none animate-pulse">
           Tap to show controls
         </div>
      )}
    </div>
  );
};

export default FullscreenViewer;
