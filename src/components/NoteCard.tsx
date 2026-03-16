import { useState } from 'react';
import { NoteCard as NoteCardType } from '../types';
import { Pin, Trash2, Edit2, X, Check, Copy } from 'lucide-react';

interface NoteCardProps {
  card: NoteCardType;
  onUpdate: (id: string, updates: Partial<NoteCardType>) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const fontSizeClasses = {
  normal: 'text-base',
  large: 'text-xl',
  xlarge: 'text-3xl font-bold',
};

export function NoteCard({ card, onUpdate, onDelete, onTogglePin }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editContent, setEditContent] = useState(card.content);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onUpdate(card.id, { title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditContent(card.content);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(card.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cycleFontSize = () => {
    const sizes: NoteCardType['fontSize'][] = ['normal', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(card.fontSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    onUpdate(card.id, { fontSize: nextSize });
  };

  return (
    <div
      className={`${card.color} rounded-xl shadow-lg overflow-hidden flex flex-col min-h-[200px] transition-transform hover:scale-[1.02] ${
        card.isPinned ? 'ring-4 ring-white ring-opacity-50' : ''
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between p-3 pb-2">
        {isEditing ? (
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="flex-1 bg-black bg-opacity-30 text-inherit font-bold text-sm px-2 py-1 rounded border border-white border-opacity-50 focus:outline-none focus:ring-2 focus:ring-white"
            autoFocus
          />
        ) : (
          <h3 className="font-bold text-sm flex-1 leading-tight">{card.title}</h3>
        )}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-1 rounded hover:bg-black hover:bg-opacity-20" title="Save">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleCancel} className="p-1 rounded hover:bg-black hover:bg-opacity-20" title="Cancel">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onTogglePin(card.id)}
                className={`p-1 rounded hover:bg-black hover:bg-opacity-20 transition-opacity ${card.isPinned ? 'opacity-100' : 'opacity-50'}`}
                title={card.isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsEditing(true)} className="p-1 rounded hover:bg-black hover:bg-opacity-20 opacity-50 hover:opacity-100" title="Edit">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(card.id)} className="p-1 rounded hover:bg-black hover:bg-opacity-20 opacity-50 hover:opacity-100" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 px-3 pb-2">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full h-32 bg-black bg-opacity-30 text-inherit px-2 py-1 rounded border border-white border-opacity-50 focus:outline-none focus:ring-2 focus:ring-white resize-none text-sm"
          />
        ) : (
          <p className={`${fontSizeClasses[card.fontSize]} leading-tight whitespace-pre-wrap break-words`}>
            {card.content}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-black bg-opacity-20">
        <span className="text-xs opacity-70">{card.category}</span>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <button
                onClick={cycleFontSize}
                className="text-xs opacity-70 hover:opacity-100 font-bold px-1 py-0.5 rounded hover:bg-black hover:bg-opacity-20"
                title="Change font size"
              >
                {card.fontSize === 'normal' ? 'A' : card.fontSize === 'large' ? 'A+' : 'A++'}
              </button>
              <button
                onClick={handleCopy}
                className="text-xs opacity-70 hover:opacity-100 flex items-center gap-1"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
