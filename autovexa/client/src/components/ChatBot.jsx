import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaTrash } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { chatAPI, getErrorMessage } from '../services/api';

const SUGGESTIONS = [
  'How do I book a car?',
  'Demo login credentials',
  'How to become a vendor?',
  'How do filters work?',
];

function getOrCreateSessionId() {
  const key = 'autovexa_chat_session';
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm VexaBot 🚗 Ask me anything about AutoVexa. Your chat history is saved so I can remember this conversation.",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, messages, typing]);

  // Load past conversation from database when panel opens
  useEffect(() => {
    if (!open || historyLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await chatAPI.getHistory(sessionId);
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setMessages([
            {
              role: 'bot',
              text: "Welcome back! Here's our previous conversation. How can I help you today?",
            },
            ...data.map((m) => ({ role: m.role, text: m.text })),
          ]);
        }
      } catch {
        /* offline / first visit — keep welcome message */
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, historyLoaded, sessionId]);

  const send = async (raw) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setTyping(true);

    try {
      const { data } = await chatAPI.send(sessionId, text);
      const reply = data.reply || data.message || 'Sorry, I could not respond.';
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch (err) {
      const msg = getErrorMessage(err, 'Could not reach the AI assistant. Is the server running?');
      setMessages((m) => [...m, { role: 'bot', text: `⚠️ ${msg}` }]);
    } finally {
      setTyping(false);
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Clear this chat history?')) return;
    try {
      await chatAPI.clearHistory(sessionId);
    } catch {
      /* still clear local UI */
    }
    setMessages([
      {
        role: 'bot',
        text: "Chat cleared. I'm VexaBot — ask me anything about AutoVexa.",
      },
    ]);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[min(100vw-2rem,380px)] h-[min(72vh,520px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/25 border border-slate-200/80 bg-white animate-fade-up"
          role="dialog"
          aria-label="AutoVexa chat assistant"
        >
          <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-950 text-white shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FaRobot className="text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight flex items-center gap-1.5">
                VexaBot <HiSparkles className="text-amber-400" />
              </p>
              <p className="text-[11px] text-slate-400">AI assistant · history saved</p>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="p-2 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white"
              title="Clear chat"
              aria-label="Clear chat history"
            >
              <FaTrash className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition text-slate-300 hover:text-white"
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white'
                      : 'bg-gradient-to-br from-amber-400 to-orange-600 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                </div>
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-md'
                      : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-xs">
                  <FaRobot />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 bg-slate-50 border-t border-slate-100">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-700 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about AutoVexa..."
                className="flex-1 input-field !py-2.5 !min-h-[44px] text-sm"
                disabled={typing}
                maxLength={2000}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className="btn-primary !min-h-[44px] !px-4 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Send message"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          open
            ? 'bg-slate-800 hover:bg-slate-700'
            : 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-500/40'
        }`}
        aria-label={open ? 'Close chat' : 'Open AutoVexa assistant'}
      >
        {open ? <FaTimes className="text-xl" /> : <FaRobot className="text-2xl" />}
      </button>
    </div>
  );
}
