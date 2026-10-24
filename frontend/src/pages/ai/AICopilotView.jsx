import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Wrench,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  Wifi,
  Printer,
  KeyRound,
  Laptop
} from 'lucide-react';
import { chatWithAI } from '../../services/aiService';
import LogoIcon from '../../components/illustrations/LogoIcon';
import toast from 'react-hot-toast';

const PRESET_DIAGNOSTICS = [
  {
    id: 'network',
    title: 'Network & VPN Doctor',
    icon: Wifi,
    category: 'Network',
    priority: 'High',
    description: 'Diagnose intermittent drops, VPN gateway timeouts, corporate Wi-Fi authentication, or DNS cache issues.',
    checklist: [
      'Check if corporate Wi-Fi is connected with valid IP address',
      'Run "ipconfig /flushdns" in Command Prompt',
      'Toggle VPN connection off and back on',
      'Verify proxy settings are set to auto-detect'
    ],
    sampleIssue: 'Cannot connect to corporate VPN. Connection times out at 80% with error 800.'
  },
  {
    id: 'hardware',
    title: 'Hardware & Display',
    icon: Laptop,
    category: 'Hardware',
    priority: 'Medium',
    description: 'Screen flickering, dual monitor failure, docking station power delivery, and battery drain diagnostics.',
    checklist: [
      'Unplug external monitors and docking cable for 15 seconds',
      'Perform hard power reset: hold power button for 30s while unplugged',
      'Inspect display cable for physical damage or loose pin seating',
      'Check Device Manager for yellow display driver warnings'
    ],
    sampleIssue: 'External display is black when connecting laptop to USB-C dock after waking from sleep.'
  },
  {
    id: 'printer',
    title: 'Print Spooler Healer',
    icon: Printer,
    category: 'Printer',
    priority: 'Low',
    description: 'Clear stuck documents in queue, reset the Windows Print Spooler service, and ping network printers.',
    checklist: [
      'Check printer panel for paper jam or yellow warning indicator',
      'Open services.msc and restart "Print Spooler" service',
      'Delete orphaned queue files in C:\\Windows\\System32\\spool\\PRINTERS',
      'Ensure workstation is on the same office VLAN subnet'
    ],
    sampleIssue: 'Network printer on 2nd floor shows "offline" status and print jobs get stuck in spooler.'
  },
  {
    id: 'access',
    title: 'SSO & Access Recovery',
    icon: KeyRound,
    category: 'Software',
    priority: 'High',
    description: 'Resolve Azure AD / Okta SSO authentication loops, expired credentials, and MFA push notification failures.',
    checklist: [
      'Clear browser cookies for corporate login portal',
      'Check if time/timezone on workstation is set to automatic sync',
      'Verify Authenticator app code matches the push number',
      'Attempt private/incognito window authentication'
    ],
    sampleIssue: 'Single Sign-On login redirects in a loop when accessing internal CRM dashboard.'
  }
];

const SUGGESTED_PROMPTS = [
  'How do I flush DNS and reset my network adapter?',
  'Outlook search is broken and not indexing new emails',
  'Laptop fan is spinning loud and CPU is at 100%',
  'What is our SLA resolution time for High priority tickets?'
];

export default function AICopilotView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'diagnostics'
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your **OpsPulse AI Copilot** — your enterprise IT operations and diagnostic assistant.\n\nAsk me any technical question, run automated troubleshooting workflows, or turn any solution into an official IT complaint with 1 click!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(PRESET_DIAGNOSTICS[0]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, text: m.text }));
      const reply = await chatWithAI(query, history);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'I ran into an issue connecting to the AI inference service, but here is standard troubleshooting advice:\n\n1. Verify your network or hardware connection.\n2. Restart the affected application or background service.\n3. If unresolved, feel free to use the "File Ticket" button below to escalate to IT Operations!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCreateTicketFromDiagnostic = (diag) => {
    navigate('/employee/raise-complaint', {
      state: {
        title: diag.title + ': ' + diag.sampleIssue.substring(0, 50),
        category: diag.category,
        priority: diag.priority,
        description: `**Automated Diagnostic**: ${diag.title}\n\n**Observed Issue**: ${diag.sampleIssue}\n\n**Troubleshooting Checklist Attempted**:\n${diag.checklist.map(c => `- [x] ${c}`).join('\n')}\n\n**Requested Action**: IT Engineer dispatch or remote session required.`
      }
    });
    toast.success('Diagnostic loaded into Raise Complaint form!');
  };

  const handleCreateTicketFromChat = (msgText) => {
    navigate('/employee/raise-complaint', {
      state: {
        title: 'IT Issue diagnosed via AI Copilot',
        category: 'Software',
        priority: 'Medium',
        description: `**AI Diagnostics Summary**:\n\n${msgText}\n\n*Logged via OpsPulse AI Copilot Hub*`
      }
    });
    toast.success('Transferred to complaint creation!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-700/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <LogoIcon className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">OpsPulse AI Copilot Hub</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Real-time
                </span>
              </div>
              <p className="text-blue-200 text-sm mt-1 max-w-xl">
                Instant IT issue resolution, automated root-cause diagnostics, and one-click ticket generation powered by Gemini.
              </p>
            </div>
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-gray-900 shadow-md font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              AI IT Assistant
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'diagnostics'
                  ? 'bg-white text-gray-900 shadow-md font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Diagnostic Toolkits
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chat' ? (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left 3 cols: Chat conversation */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[650px] overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-gray-100 dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200/50 dark:border-gray-600/50'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.role === 'assistant' && (
                      <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-600/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCopy(msg.text, idx)}
                            className="hover:text-primary transition-colors flex items-center gap-1"
                          >
                            {copiedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedIndex === idx ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <button
                          onClick={() => handleCreateTicketFromChat(msg.text)}
                          className="text-primary hover:underline font-medium flex items-center gap-1"
                        >
                          Convert to Ticket <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 flex-shrink-0 mt-0.5">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center text-gray-500 dark:text-gray-400 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-primary flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <span>OpsPulse AI is formulating diagnostic analysis...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a technical question (e.g. My laptop won't connect to VPN, what steps should I take?)..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary shadow-inner"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Ask AI</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right 1 col: Quick Suggestion Prompts & Status */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3 text-sm">
                <Sparkles className="w-4 h-4 text-primary" /> Quick Troubleshooting
              </h3>
              <div className="space-y-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="w-full text-left p-2.5 rounded-xl text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-primary/10 hover:text-primary transition-all border border-gray-200/60 dark:border-gray-600/60 line-clamp-2"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-slate-800 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold text-sm mb-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Enterprise IT SLA Guard
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                OpsPulse AI analyzes incoming issues against standard SLA thresholds:
              </p>
              <ul className="text-xs space-y-1.5 text-gray-700 dark:text-gray-300">
                <li className="flex justify-between">
                  <span className="font-medium text-red-600 dark:text-red-400">High / Blocker</span>
                  <span className="font-mono">4 Hours SLA</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium text-amber-600 dark:text-amber-400">Medium Priority</span>
                  <span className="font-mono">12 Hours SLA</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium text-blue-600 dark:text-blue-400">Low / Question</span>
                  <span className="font-mono">24 Hours SLA</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Diagnostic Toolkits Tab */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column: Toolkits selector */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white px-1">
              Select IT Diagnostic Playbook
            </h2>
            {PRESET_DIAGNOSTICS.map((diag) => {
              const Icon = diag.icon;
              const isSelected = selectedDiagnostic.id === diag.id;
              return (
                <button
                  key={diag.id}
                  onClick={() => setSelectedDiagnostic(diag)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20' : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{diag.title}</div>
                      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        Category: {diag.category}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 2 columns: Active Diagnostic Detail */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {selectedDiagnostic.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedDiagnostic.description}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                selectedDiagnostic.priority === 'High'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {selectedDiagnostic.priority} Priority
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Step-by-step Self-Service Triage Checklist
              </h4>
              <div className="space-y-2 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl border border-gray-200/60 dark:border-gray-600/60">
                {selectedDiagnostic.checklist.map((step, idx) => (
                  <label key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" className="mt-1 rounded text-primary focus:ring-primary w-4 h-4" />
                    <span>{step}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Observed Symptom Sample */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl text-sm">
              <div className="font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Sample Observed Failure
              </div>
              <p className="text-amber-900/80 dark:text-amber-200/80 text-xs">
                "{selectedDiagnostic.sampleIssue}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Did the self-service steps resolve the problem? If not, escalate immediately.
              </p>
              <button
                onClick={() => handleCreateTicketFromDiagnostic(selectedDiagnostic)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
              >
                <span>Convert to IT Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
