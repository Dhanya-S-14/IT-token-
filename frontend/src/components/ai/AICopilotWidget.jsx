import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Wrench,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { chatWithAI } from '../../services/aiService';

import { useNavigate, useLocation } from 'react-router-dom';
import LogoIcon from '../illustrations/LogoIcon';

const QUICK_PROMPTS = [
  'How do I report a hardware or screen issue?',
  'Quick fix: VPN connection dropped',
  'Network printer not responding',
  'How are priority levels assigned?'
];

export default function AICopilotWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your OpsPulse AI Copilot. Ask me anything about diagnosing issues, logging complaints, or IT troubleshooting!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    const newMsg = { role: 'user', text: textToSend.trim() };
    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, text: m.text }));
      const reply = await chatWithAI(textToSend.trim(), history);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'I am currently processing your request. Please check your network or try raising a ticket directly via the "Raise Complaint" page.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFullHub = () => {
    setOpen(false);
    navigate(isAdmin ? '/admin/ai-copilot' : '/employee/ai-copilot');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(prev => !prev)}
          className="relative group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-full shadow-xl hover:shadow-primary/30 transition-all font-medium text-sm border border-white/20"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span>OpsPulse AI Copilot</span>
        </motion.button>
      </div>

      {/* Floating Chat Drawer/Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[380px] sm:w-[420px] h-[540px] max-h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center p-1">
                  <LogoIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight flex items-center gap-1.5">
                    OpsPulse AI Copilot
                  </h3>
                  <p className="text-[11px] text-white/80">Active AI Troubleshooting Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleOpenFullHub}
                  title="Open Full AI Diagnostic Hub"
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/60 overflow-x-auto flex gap-1.5 no-scrollbar">
              {QUICK_PROMPTS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="whitespace-nowrap text-[11px] px-2.5 py-1 bg-white dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/40 dark:to-gray-800">
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isUser
                          ? 'bg-primary text-white'
                          : 'bg-indigo-100 dark:bg-indigo-900/60 text-primary'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-600 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-gray-700 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  </div>
                  <span className="italic">OpsPulse AI is generating response...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI Copilot for IT help..."
                className="flex-1 px-3.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
