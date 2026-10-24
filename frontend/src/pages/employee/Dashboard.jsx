import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Clock, CheckCircle, AlertCircle, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await complaintService.getEmployeeStats();
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const cards = [
    { icon: Ticket, label: 'Total Complaints', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Clock, label: 'Pending', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { icon: CheckCircle, label: 'Resolved', value: stats.resolved, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  const chartData = [
    { name: 'Total', value: stats.total || 1 },
    { name: 'Pending', value: stats.pending || 0 },
    { name: 'Resolved', value: stats.resolved || 0 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's your complaint overview.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complaint Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RPieChart>
              <Pie data={chartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {chartData.filter(d => d.value > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </RPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          <Link to="/employee/my-complaints" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/employee/raise-complaint" className="p-4 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 transition-all hover:shadow-sm">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <span>Raise a Complaint</span>
              <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">AI</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Submit issue with smart auto-detect & auto-fill</p>
          </Link>
          <Link to="/employee/my-complaints" className="p-4 bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30 transition-all hover:shadow-sm">
            <p className="font-semibold text-yellow-700 dark:text-yellow-400">Track Complaints</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Check status and SLA progress</p>
          </Link>
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/40">
            <p className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
              ✨ 24/7 AI IT Copilot
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Click the floating button on bottom-right for instant troubleshooting tips
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
