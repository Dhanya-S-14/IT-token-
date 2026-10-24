import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, CheckCircle, Star, ChevronDown, MessageCircle, Plus, X, Menu, Sparkles, BarChart3, Clock, Bell, Search, FileText, Users, TrendingUp, PieChart, Layers, Server, Lock, Zap, ExternalLink, Play, Award, Github, Linkedin, Mail, Phone, MapPin, ArrowUp, HelpCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { EmployeeIllustration, AdminIllustration, ComplaintIllustration, AnalyticsIllustration } from '../components/illustrations/CardIllustrations';
import LogoIcon from '../components/illustrations/LogoIcon';
import { chatWithAI } from '../services/aiService';

const navLinks = ['Home', 'Features', 'How It Works', 'Dashboard', 'Testimonials', 'FAQ', 'Contact'];

const features = [
  { icon: Zap, title: 'AI Powered Routing', desc: 'Intelligent complaint assignment to the right team automatically', color: 'from-purple-500 to-pink-500' },
  { icon: Clock, title: 'Real-time Tracking', desc: 'Track every complaint with unique token IDs from submission to resolution', color: 'from-blue-500 to-cyan-500' },
  { icon: Bell, title: 'Instant Notifications', desc: 'Get instant updates when your complaint status changes or gets assigned', color: 'from-orange-500 to-red-500' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Comprehensive charts and reports for informed decision making', color: 'from-green-500 to-emerald-500' },
  { icon: Search, title: 'Global Search', desc: 'Search across complaints, employees, tokens, and deployments instantly', color: 'from-indigo-500 to-purple-500' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security with JWT authentication and encrypted data', color: 'from-rose-500 to-pink-500' },
];

const statsData = [
  { value: 12500, suffix: '+', label: 'Complaints Resolved', icon: CheckCircle },
  { value: 850, suffix: '+', label: 'Active Employees', icon: Users },
  { value: 99.9, suffix: '%', label: 'Uptime Guarantee', icon: Shield },
  { value: 4.5, suffix: ' hrs', label: 'Avg Resolution Time', icon: Clock },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'HR Manager', company: 'TechCorp', text: 'The complaint resolution process is much faster now. We went from days to hours.', rating: 5 },
  { name: 'Rahul Sharma', role: 'Software Engineer', company: 'InnoSoft', text: 'Easy to track every issue. The token system makes it simple to follow up.', rating: 5 },
  { name: 'Priya Patel', role: 'IT Administrator', company: 'DataFlow', text: 'Simple UI with excellent reporting. The analytics dashboard is a game changer.', rating: 5 },
  { name: 'Michael Chen', role: 'Operations Lead', company: 'CloudBase', text: 'Reduced our complaint resolution time by 60%. Highly recommended for enterprises.', rating: 5 },
];

const faqs = [
  { q: 'How do I raise a complaint?', a: 'Simply log in to the Employee Portal, click on "Raise Complaint", fill in the details, upload a screenshot if needed, and submit. You\'ll receive a unique token ID instantly.' },
  { q: 'Can I track my complaint status?', a: 'Yes! Every complaint gets a unique token (e.g., IT-2026-000145). You can track its status in real-time from your dashboard or by entering the token.' },
  { q: 'Can I upload screenshots?', a: 'Absolutely. You can attach screenshots when raising a complaint to help the team understand the issue better.' },
  { q: 'How do admins assign engineers?', a: 'Admins can view all complaints, assign them to specific engineers, set priority levels, and add remarks for reference.' },
  { q: 'How do I download reports?', a: 'Admins can generate and download reports in PDF, Excel, and CSV formats from the Reports section.' },
  { q: 'Is my data secure?', a: 'Yes. We use JWT authentication, bcrypt password hashing, and all data is encrypted. Your information is fully protected.' },
];

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{typeof value === 'number' ? Math.floor(count).toLocaleString() : value}{suffix}</span>;
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'assistant', text: 'Hi! How can we help you today?' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeSection, setActiveSection] = useState('Home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = navLinks.map(l => l.toLowerCase().replace(/\s/g, ''));
      for (const s of sections.reverse()) {
        const el = document.getElementById(s);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(s.charAt(0).toUpperCase() + s.slice(1));
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    let attempts = 0;
    const trySend = async () => {
      try {
        const reply = await chatWithAI(msg, chatMessages.slice(-10).map(m => ({ role: m.role, text: m.text })));
        setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      } catch (err) {
        if (attempts < 2 && err?.response?.status === 429) {
          attempts++;
          await new Promise(r => setTimeout(r, 2000));
          return trySend();
        }
        throw err;
      }
    };
    try {
      await trySend();
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I\'m having trouble. The AI service may be temporarily rate-limited. Please try again in a moment.' }]);
    }
    setChatLoading(false);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id.toLowerCase().replace(/\s/g, ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:24px_24px] opacity-30" />
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <LogoIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Complaint<span className="text-primary">Pro</span></span>
                    <p className="text-[10px] text-gray-400 -mt-1">Enterprise Platform</p>
                  </div>
                </div>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(l => (
                <button key={l} onClick={() => scrollTo(l)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === l ? 'text-primary bg-primary/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{l}</button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link to="/login/admin" className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary dark:hover:border-primary transition-all">Admin Login</Link>
              <Link to="/login/employee" className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300">Employee Login</Link>
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="px-4 py-4 space-y-2">
                {navLinks.map(l => (
                  <button key={l} onClick={() => scrollTo(l)} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary transition-all">{l}</button>
                ))}
                <div className="pt-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/login/admin" className="block w-full text-center px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200">Admin Login</Link>
                  <Link to="/login/employee" className="block w-full text-center px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold">Employee Login</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section id="home" className="relative pt-32 pb-24 lg:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 mb-8">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Trusted by 500+ Enterprises</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6">
                Enterprise{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-purple-600 bg-clip-text text-transparent">IT Helpdesk</span>{' '}
                Platform
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                Raise, Track and Resolve IT complaints faster with real-time updates, smart analytics, and seamless team collaboration.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['AI Powered', 'Real-time Tracking', 'Secure', 'Fast Resolution'].map((badge, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" /> {badge}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/login/employee" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                  Get Started <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login/admin" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-semibold text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary transition-all">Admin Portal</Link>
                <button className="inline-flex items-center gap-2 px-6 py-4 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center"><Play className="w-5 h-5 text-primary ml-0.5" /></div>
                  <span className="text-sm font-medium">Watch Demo</span>
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
                  <span className="text-xs text-gray-400 ml-2">OpsPulse Dashboard</span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Total', value: '1,284', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                      { label: 'Resolved', value: '1,042', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                      { label: 'Pending', value: '187', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                    ].map((card, i) => (
                      <div key={i} className={`${card.bg} rounded-xl p-4`}>
                        <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="flex items-end gap-3 h-20">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((h, i) => (
                        <motion.div key={i} initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: i * 0.1, duration: 0.5 }} className="w-6 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg" style={{ height: h }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="py-24 px-4 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4"><Layers className="w-4 h-4" /> Dashboard Preview</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Explore OpsPulse</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">See how our platform works across different views and roles</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Employee Dashboard', desc: 'Track your complaints', color: 'from-blue-500 to-cyan-500', ill: EmployeeIllustration },
              { label: 'Admin Dashboard', desc: 'System overview & analytics', color: 'from-purple-500 to-pink-500', ill: AdminIllustration },
              { label: 'Complaint Tracking', desc: 'Real-time status updates', color: 'from-orange-500 to-red-500', ill: ComplaintIllustration },
              { label: 'Analytics', desc: 'Charts & reports', color: 'from-green-500 to-emerald-500', ill: AnalyticsIllustration },
            ].map((item, i) => {
              const Ill = item.ill;
              return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                <div className={`h-40 bg-gradient-to-br ${item.color} flex items-center justify-center p-4`}>
                  <Ill />
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full text-sm font-medium text-primary mb-4"><Sparkles className="w-4 h-4" /> Powerful Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose OpsPulse?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to manage IT complaints efficiently in one platform</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">{feat.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
                <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  Learn More <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="howitworks" className="py-24 px-4 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4"><Layers className="w-4 h-4" /> Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">From complaint submission to resolution in 6 simple steps</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent -translate-x-1/2" />
            {[
              { step: '01', title: 'Employee Raises Complaint', desc: 'Submit your issue with details and optional screenshot', icon: Users, color: 'from-blue-500 to-cyan-500', side: 'left' },
              { step: '02', title: 'Complaint Submitted', desc: 'System registers the complaint and generates a unique token', icon: CheckCircle, color: 'from-green-500 to-emerald-500', side: 'right' },
              { step: '03', title: 'Token Generated', desc: 'You receive a unique token ID (e.g., IT-2026-000145) for tracking', icon: Shield, color: 'from-purple-500 to-pink-500', side: 'left' },
              { step: '04', title: 'Assigned to Engineer', desc: 'Admin assigns the right engineer based on category and priority', icon: Users, color: 'from-orange-500 to-red-500', side: 'right' },
              { step: '05', title: 'In Progress', desc: 'Engineer works on the issue with real-time status updates', icon: Clock, color: 'from-yellow-500 to-orange-500', side: 'left' },
              { step: '06', title: 'Resolved & Closed', desc: 'Issue resolved, feedback collected, and complaint closed', icon: Award, color: 'from-green-500 to-teal-500', side: 'right' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: item.side === 'left' ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className={`relative flex items-center gap-8 mb-12 lg:mb-16 ${item.side === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} shadow-xl items-center justify-center z-10">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex-1 ${item.side === 'right' ? 'lg:text-right lg:pr-20' : 'lg:pl-20'}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white text-sm font-bold mb-3 lg:hidden`}>{item.step}</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <div className="hidden lg:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-purple-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Impact in Numbers</h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Trusted by enterprises worldwide for complaint management</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {statsData.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5 backdrop-blur-sm border border-white/10">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-primary-foreground/70 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4"><Star className="w-4 h-4 fill-current" /> Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Hear from the people who use OpsPulse every day</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                  <div><p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p><p className="text-xs text-gray-500">{t.role}, {t.company}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4"><HelpCircle className="w-4 h-4" /> FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Got questions? We've got answers</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-4 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">Get In Touch</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">Join thousands of employees and administrators using OpsPulse for seamless IT operations management.</p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/login/employee" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">Employee Portal</Link>
                <Link to="/login/admin" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl font-semibold text-gray-700 dark:text-gray-200 hover:border-primary transition-all">Admin Portal</Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400"><Mail className="w-5 h-5 text-primary" /> support@opspulse.com</div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400"><Phone className="w-5 h-5 text-primary" /> +1 (555) 123-4567</div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400"><MapPin className="w-5 h-5 text-primary" /> San Francisco, CA</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Your Name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" />
                    <input type="email" placeholder="Your Email" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <input type="text" placeholder="Subject" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm" />
                  <textarea rows={4} placeholder="Your Message" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-semibold hover:shadow-lg transition-all">Send Message</button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center p-2"><LogoIcon className="w-7 h-7" /></div>
                <span className="text-xl font-bold text-white">Ops<span className="text-primary">Pulse</span></span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">Enterprise IT Complaint Management System built for modern organizations to resolve issues faster.</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                {['Features', 'How It Works', 'Dashboard', 'Testimonials', 'FAQ'].map(l => (
                  <li key={l}><button onClick={() => scrollTo(l)} className="text-gray-400 hover:text-primary transition-colors">{l}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Portals</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/login/employee" className="text-gray-400 hover:text-primary transition-colors">Employee Login</Link></li>
                <li><Link to="/login/admin" className="text-gray-400 hover:text-primary transition-colors">Admin Login</Link></li>
                <li><Link to="/register/employee" className="text-gray-400 hover:text-primary transition-colors">Employee Registration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2 text-gray-400"><Mail className="w-4 h-4" /> support@opspulse.com</li>
                <li className="flex items-center gap-2 text-gray-400"><Phone className="w-4 h-4" /> +1 (555) 123-4567</li>
                <li className="flex items-center gap-2 text-gray-400"><MapPin className="w-4 h-4" /> San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} OpsPulse. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <span className="text-gray-600">Made by Dhanya S</span>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Link to="/login/employee" className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-all duration-300">
          <Plus className="w-6 h-6" />
        </Link>
        <button onClick={() => setChatOpen(!chatOpen)} className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300">
          {chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <div><p className="font-semibold text-sm">ComplaintBot</p><p className="text-xs text-white/70">AI-powered support</p></div>
              </div>
            </div>
            <div className="p-4 h-80 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl p-3 max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-50 dark:bg-gray-700/50 rounded-bl-none'}`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl rounded-bl-none p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary outline-none" />
                <button onClick={handleChatSend} disabled={chatLoading} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">Send</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}