import React, { useLayoutEffect, useRef, useState } from 'react';

interface QuickWriteModalProps {
  accentColor: string;
  onShow: (text: string) => void;
  onSaveAsCard: (text: string) => void;
  onClose: () => void;
}

// Type a message and show it right away. Nothing is saved unless the user saves it as a card.
const QuickWriteModal: React.FC<QuickWriteModalProps> = ({ accentColor, onShow, onSaveAsCard, onClose }) => {
  const [text, setText] = useState('');
  const boxRef = useRef<HTMLTextAreaElement>(null);

  // Grow the box with the text, so each new line shows.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.style.height = 'auto';
    box.style.height = `${box.scrollHeight}px`;
  }, [text]);
  const message = text.trim();

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 backdrop-blur-sm sm:px-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="quick-write-title" className="bg-zinc-900 sm:border sm:border-zinc-800 sm:rounded-3xl p-6 sm:p-8 w-full h-full sm:h-auto sm:max-w-sm flex flex-col gap-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 id="quick-write-title" className="font-black text-lg text-center">Write a note</h2>
        <p className="text-sm text-center">Not saved unless you save it as a card.</p>
        <label className="flex flex-col flex-1 sm:flex-none">
          <span className="sr-only">Message</span>
          <textarea
            ref={boxRef}
            autoFocus
            rows={5}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your message"
            className="quick-write-text w-full flex-1 p-3 text-lg text-left resize-none min-h-40 sm:flex-none overflow-hidden"
          />
        </label>
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => onShow(message)}
            disabled={!message}
            className="w-full h-12 rounded-2xl font-black text-sm disabled:opacity-30 active:scale-95 transition-all"
            style={{ backgroundColor: accentColor, color: '#000000' }}
          >
            Show now
          </button>
          <button
            onClick={() => onSaveAsCard(message)}
            disabled={!message}
            className="w-full h-12 rounded-2xl font-black text-sm bg-zinc-800 disabled:opacity-30 active:scale-95 transition-all"
          >
            Save as card
          </button>
          <button onClick={onClose} className="w-full h-12 rounded-2xl font-black text-sm bg-zinc-800 active:scale-95 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickWriteModal;
