import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { complaintService } from '../../services/complaintService';
import {
  categorizeComplaint,
  detectPriority,
  enhanceComplaint,
  getTroubleshootingSteps
} from '../../services/aiService';
import toast from 'react-hot-toast';
import { Upload, Send, Sparkles, Loader2, Wand2, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

const categories = ['Hardware', 'Software', 'Network', 'Printer', 'Email', 'Internet', 'System Issue', 'Other'];
const priorities = ['Low', 'Medium', 'High'];

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: location.state?.title || '',
    category: location.state?.category || '',
    priority: location.state?.priority || 'Medium',
    description: location.state?.description || ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [troubleshootSteps, setTroubleshootSteps] = useState([]);
  const [troubleshootLoading, setTroubleshootLoading] = useState(false);

  useEffect(() => {
    if (location.state) {
      setForm(prev => ({
        title: location.state.title || prev.title,
        category: location.state.category || prev.category,
        priority: location.state.priority || prev.priority,
        description: location.state.description || prev.description
      }));
    }
  }, [location.state]);

  const handleAiSuggest = async () => {
    const textToAnalyze = form.description || form.title;
    if (!textToAnalyze || textToAnalyze.trim().length < 5) {
      toast.error('Write at least a brief title or description first');
      return;
    }
    setAiLoading(true);
    try {
      const [category, priority] = await Promise.all([
        categorizeComplaint(textToAnalyze),
        detectPriority(textToAnalyze)
      ]);
      setForm(prev => ({
        ...prev,
        category: category || prev.category || 'Hardware',
        priority: priority || prev.priority || 'Medium'
      }));
      toast.success(`AI classified as ${category} (${priority} priority)`);

      // Also trigger quick troubleshooting steps
      loadTroubleshooting(category || 'General', textToAnalyze);
    } catch {
      toast.error('AI suggestion encountered an issue.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiEnhance = async () => {
    if (!form.description && !form.title) {
      toast.error('Please enter a title or draft description to enhance');
      return;
    }
    setEnhanceLoading(true);
    try {
      const enhanced = await enhanceComplaint(form.title, form.description);
      setForm(prev => ({ ...prev, description: enhanced }));
      toast.success('Description enhanced with professional IT ticket format!');
    } catch {
      toast.error('Could not enhance description.');
    } finally {
      setEnhanceLoading(false);
    }
  };

  const loadTroubleshooting = async (cat, desc) => {
    setTroubleshootLoading(true);
    try {
      const steps = await getTroubleshootingSteps(cat, desc);
      setTroubleshootSteps(steps || []);
    } catch {
      setTroubleshootSteps([]);
    } finally {
      setTroubleshootLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('priority', form.priority);
      formData.append('description', form.description);
      if (screenshot) formData.append('screenshot', screenshot);

      await complaintService.create(formData);
      toast.success('Complaint raised successfully!');
      navigate('/employee/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Raise a Complaint
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Powered
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Submit an IT operational issue with automated classification and troubleshooting
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Form: 2 cols */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                placeholder="e.g. Dell Laptop screen flickering / Cannot connect to office VPN"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                  {form.category && (
                    <span className="text-xs text-primary font-medium">✓ Selected</span>
                  )}
                </div>
                <select
                  value={form.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, category: val });
                    if (val) loadTroubleshooting(val, form.description);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                >
                  {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all border border-primary/20 disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
                    {aiLoading ? 'Analyzing...' : 'AI Auto-Detect'}
                  </button>

                  <button
                    type="button"
                    onClick={handleAiEnhance}
                    disabled={enhanceLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-200 dark:border-indigo-800 disabled:opacity-50"
                  >
                    {enhanceLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    {enhanceLoading ? 'Polishing...' : 'AI Polish'}
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                placeholder="Describe what happened, any error messages, and when it started..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attach Screenshot / Photo <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer relative bg-gray-50/50 dark:bg-gray-700/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-7 h-7 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {screenshot ? screenshot.name : 'Click or drag image file here (PNG, JPG)'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-primary/25 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Submitting Complaint...' : 'Submit Complaint'}
            </button>
          </form>
        </motion.div>

        {/* Right Column: AI Self-Service Assistant & Tips */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-gray-800 dark:to-gray-800/90 rounded-xl p-5 border border-indigo-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI Self-Service Diagnostic</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quick fixes you can try right now</p>
              </div>
            </div>

            {troubleshootLoading ? (
              <div className="py-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Analyzing common resolutions...
              </div>
            ) : troubleshootSteps.length > 0 ? (
              <div className="space-y-2.5">
                {troubleshootSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs bg-white/80 dark:bg-gray-700/60 p-2.5 rounded-lg border border-indigo-50 dark:border-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{step}</span>
                  </div>
                ))}
                <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-2 italic text-center">
                  Still experiencing issues? Click "Submit Complaint" and our engineers will investigate.
                </p>
              </div>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400 py-3 bg-white/60 dark:bg-gray-700/40 p-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
                <p className="mb-2">💡 <strong>Tip</strong>: Click <strong>"AI Auto-Detect"</strong> after entering your issue to automatically set category, priority, and see instant self-service fixes!</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-xs space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-primary" /> SLA Resolution Guide
            </h4>
            <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
              <div className="p-2 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium">
                High<br /><span className="text-[10px] opacity-80">&lt; 4 Hours</span>
              </div>
              <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-medium">
                Medium<br /><span className="text-[10px] opacity-80">&lt; 24 Hours</span>
              </div>
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-medium">
                Low<br /><span className="text-[10px] opacity-80">&lt; 48 Hours</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
