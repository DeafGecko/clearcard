import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, TrashIcon, EditIcon, PlusIcon } from './Icons';
import { MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: number;
}

interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ClearChatProps {
  onClose: () => void;
  accentColor: string;
}

const CHAT_KEY = 'clearchat_conversations';

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ClearChat: React.FC<ClearChatProps> = ({ onClose, accentColor }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [activeSender, setActiveSender] = useState<'me' | 'them'>('me');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || null;

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const createConversation = () => {
    const now = Date.now();
    const conv: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Conversation ${conversations.length + 1}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(conv.id);
    setActiveSender('me');
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConvId) return;
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: input.trim(),
      sender: activeSender,
      timestamp: Date.now(),
    };
    setConversations(prev => prev.map(c =>
      c.id === activeConvId
        ? { ...c, messages: [...c.messages, msg], updatedAt: Date.now() }
        : c
    ));
    setInput('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveName = () => {
    if (!nameInput.trim() || !activeConvId) return;
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, name: nameInput.trim() } : c
    ));
    setEditingName(false);
  };

  const clearMessages = () => {
    if (!activeConvId) return;
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, messages: [], updatedAt: Date.now() } : c
    ));
  };

  // CONVERSATION LIST VIEW
  if (!activeConvId) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-6 pt-12 pb-4 border-b border-zinc-900">
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeftIcon />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-black uppercase tracking-tight">ClearChat</h2>
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Conversations</p>
          </div>
          <button
            onClick={createConversation}
            className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform text-black"
            style={{ backgroundColor: accentColor }}
          >
            <PlusIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center" style={{ color: accentColor }}>
                <MessageCircle size={28} />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-widest mb-1">No Conversations</p>
                <p className="text-zinc-600 text-xs max-w-[220px] leading-relaxed">Tap + to start a new silent conversation.</p>
              </div>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => { setActiveConvId(conv.id); setActiveSender('me'); }}
                className="bg-zinc-950 border border-zinc-900 rounded-[24px] px-5 py-4 flex items-center gap-4 cursor-pointer active:bg-zinc-900 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor }}>
                  <MessageCircle size={20} color="black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-base truncate">{conv.name}</p>
                  <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    {formatDate(conv.updatedAt)} · {conv.messages.length} messages
                  </p>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-red-500 active:scale-125 transition-all"
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="px-4 pb-10 pt-3">
          <button
            onClick={createConversation}
            className="w-full h-14 rounded-2xl font-black text-sm text-black active:scale-95 transition-all"
            style={{ backgroundColor: accentColor }}
          >
            + NEW CONVERSATION
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE CONVERSATION VIEW
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-6 pt-12 pb-4 border-b border-zinc-900">
        <button onClick={() => setActiveConvId(null)} className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeftIcon />
        </button>
        <div className="text-center flex-1 px-2">
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1 text-sm font-black text-center w-full outline-none"
            />
          ) : (
            <button
              onClick={() => { setNameInput(activeConv?.name || ''); setEditingName(true); }}
              className="flex items-center justify-center gap-1.5 mx-auto"
            >
              <span className="text-base font-black uppercase tracking-tight truncate max-w-[160px]">{activeConv?.name}</span>
              <EditIcon />
            </button>
          )}
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-0.5">
            {activeConv ? formatDate(activeConv.createdAt) : ''}
          </p>
        </div>
        <button onClick={clearMessages} className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center active:scale-90 transition-transform text-zinc-500 hover:text-red-500">
          <TrashIcon />
        </button>
      </div>

      {/* Sender Toggle */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-900">
        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mr-1">Typing as:</span>
        <button
          onClick={() => setActiveSender('me')}
          className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${activeSender === 'me' ? 'text-black border-transparent' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
          style={activeSender === 'me' ? { backgroundColor: accentColor } : {}}
        >Me</button>
        <button
          onClick={() => setActiveSender('them')}
          className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${activeSender === 'them' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
        >Them</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {activeConv?.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center" style={{ color: accentColor }}>
              <MessageCircle size={28} />
            </div>
            <p className="text-zinc-600 text-xs max-w-[220px] leading-relaxed">Type a message and pass the phone back and forth.</p>
          </div>
        )}
        {activeConv?.messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[78%] px-5 py-3 rounded-3xl text-base font-bold leading-snug break-words ${
                msg.sender === 'me' ? 'text-black rounded-br-lg' : 'bg-zinc-800 text-white rounded-bl-lg'
              }`}
              style={msg.sender === 'me' ? { backgroundColor: accentColor } : {}}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-10 pt-3 border-t border-zinc-900 flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activeSender === 'me' ? 'Type your message...' : 'They type here...'}
          rows={1}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white font-bold text-base outline-none resize-none max-h-32 leading-snug"
          style={{ minHeight: '48px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black active:scale-90 transition-all disabled:opacity-30 shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </div>
  );
};

export default ClearChat;
