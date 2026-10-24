import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  RefreshCw,
  Zap,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import api from '../../services/api';
import { getAIInsights } from '../../services/aiService';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/activity/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    setAiLoading(true);
    try {
      const res = await getAIInsights();
      if (res?.insights) {
        setAiInsights(res.insights);
      }
    } catch (e) {
      console.warn('AI Insights notice:', e);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAIInsights();
  }, []);

  const cards = [
    { icon: Users, label: 'Total Employees', value: stats?.totalEmployees, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Users, label: 'Active Employees', value: stats?.activeEmployees, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: Ticket, label: 'Total Complaints', value: stats?.totalComplaints, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: Clock, label: 'Pending', value: stats?.pendingComplaints, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { icon: CheckCircle, label: 'Resolved', value: stats?.resolvedComplaints, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: AlertTriangle, label: 'High Priority', value: stats?.highPriority, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { icon: Calendar, label: "Today's Complaints", value: stats?.todayComplaints, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Admin Dashboard
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ● Live Systems
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Overview of enterprise IT infrastructure & complaint resolution metrics
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchAIInsights();
          }}
          disabled={loading || aiLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || aiLoading ? 'animate-spin text-primary' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* AI Executive Insights Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-yellow-300 flex items-center gap-2">
                OpsPulse AI Executive Intelligence
              </h2>
            </div>
            <button
              onClick={fetchAIInsights}
              disabled={aiLoading}
              className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {aiLoading ? (
              <div className="col-span-3 py-4 text-center text-xs text-indigo-200">
                Generating live operational observations with Gemini AI...
              </div>
            ) : aiInsights.length > 0 ? (
              aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs leading-relaxed"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-200 mb-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    Insight #{idx + 1}
                  </div>
                  <p className="text-gray-200">{insight}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-xs text-indigo-200">
                Resolution metrics are operating normally with stable ticket turnaround times across departments.
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : card.value ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Complaints</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="_id" tickFormatter={(v) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][v - 1]} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Wise</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats?.departmentData || []} cx="50%" cy="50%" outerRadius={100} paddingAngle={5} dataKey="count" nameKey="_id" label={({ _id, count }) => `${_id}: ${count}`}>
                {(stats?.departmentData || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats?.priorityData || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count" nameKey="_id" label={({ _id, count }) => `${_id}: ${count}`}>
                {(stats?.priorityData || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Link to="/admin/activity" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{a.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.details || a.resource}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleTimeString()}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-6 text-center">No recent activities logged</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
