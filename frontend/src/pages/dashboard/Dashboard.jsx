import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analyticsService';
import { incidentService } from '../../services/incidentService';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton, CardSkeleton } from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import {
  AlertCircle, AlertTriangle, Clock, CheckCircle,
  TrendingUp, TrendingDown, Users, Activity,
  PlusCircle, Monitor, BookOpen, ArrowRight
} from 'lucide-react';
import Button from '../../components/ui/Button';

const PIE_COLORS = { Critical: '#EF4444', High: '#F97316', Medium: '#EAB308', Low: '#22C55E' };
const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

const statCards = [
  {
    title: 'Open Incidents', key: 'openIncidents', icon: AlertCircle,
    gradient: 'from-blue-600 to-blue-400', lightBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200/50 dark:border-blue-500/20',
  },
  {
    title: 'Critical Incidents', key: 'criticalIncidents', icon: AlertTriangle,
    gradient: 'from-rose-600 to-rose-400', lightBg: 'bg-rose-50 dark:bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400', borderClass: 'border-rose-200/50 dark:border-rose-500/20',
  },
  {
    title: 'Pending Changes', key: 'pendingChanges', icon: Clock,
    gradient: 'from-amber-600 to-amber-400', lightBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400', borderClass: 'border-amber-200/50 dark:border-amber-500/20',
  },
  {
    title: 'SLA Met', key: 'slaMet', icon: CheckCircle,
    gradient: 'from-emerald-600 to-emerald-400', lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200/50 dark:border-emerald-500/20',
    suffix: '%',
  },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
      <p className="text-sm font-medium" style={{ color: payload[0].payload.fill }}>{payload[0].value}</p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getStatusVariant(status) {
  const map = { open: 'info', in_progress: 'warning', resolved: 'success', closed: 'secondary', pending: 'warning', approved: 'success', rejected: 'destructive' };
  return map[status] || 'default';
}

function getPriorityLabel(p) {
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : '';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsService.getDashboard(),
  });

  const dashboardData = data?.data?.data;
  const stats = dashboardData?.stats || {};
  const monthlyTrends = dashboardData?.monthlyTrends || [];
  const priorityDistribution = dashboardData?.priorityDistribution || [];
  const departmentWise = dashboardData?.departmentWise || [];
  const engineerPerformance = dashboardData?.engineerPerformance || [];
  const recentActivity = dashboardData?.recentActivity || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error?.message || 'An unexpected error occurred'}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.name || 'User'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">{stats.openIncidents ?? '--'} active</Badge>
        </div>
      </motion.div>

      {isLoading ? (
        <>
          <CardSkeleton count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardContent><Skeleton className="h-72 w-full" /></CardContent></Card>
            <Card><CardContent><Skeleton className="h-72 w-full" /></CardContent></Card>
          </div>
          <Card><CardContent><Skeleton className="h-72 w-full" /></CardContent></Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
          </div>
        </>
      ) : (
        <motion.div variants={containerVariants} className="space-y-6">
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              const value = stats[card.key];
              const displayValue = value !== null && value !== undefined ? value : 0;
              const trend = stats[`${card.key}Trend`];
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative overflow-hidden ${card.borderClass}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-[0.07] dark:opacity-[0.12]`} />
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{card.title}</span>
                        <div className={`p-2 rounded-xl ${card.lightBg}`}>
                          <Icon className={`w-4 h-4 ${card.iconColor}`} />
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                          {typeof displayValue === 'number' && displayValue % 1 !== 0 ? displayValue.toFixed(1) : displayValue}
                          {card.suffix}
                        </span>
                        {trend !== undefined && (
                          <span className={`flex items-center text-xs font-semibold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                            {Math.abs(trend)}%
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200/50 dark:border-gray-700/50">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Monthly Incident Trends</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Incidents</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrends.length ? monthlyTrends : [{ month: 'No data', count: 0 }]}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fill="url(#trendGradient)" name="Incidents" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-gray-200/50 dark:border-gray-700/50">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Priority Distribution</h3>
                </div>
                <div className="flex items-center justify-center h-[300px]">
                  {priorityDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={priorityDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {priorityDistribution.map((entry, i) => (
                            <Cell key={i} fill={PIE_COLORS[entry.name] || '#6B7280'} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{getPriorityLabel(value)}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-400">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-gray-200/50 dark:border-gray-700/50">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Department-wise Incidents</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentWise.length ? departmentWise : [{ department: 'No data', count: 0 }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                      {departmentWise.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200/50 dark:border-gray-700/50">
              <CardContent>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Engineer Performance</h3>
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                {engineerPerformance.length > 0 ? (
                  <div className="space-y-3">
                    {engineerPerformance.map((eng, i) => (
                      <div key={eng._id || i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-blue-500'}`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{eng.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{eng.role || 'Engineer'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{eng.resolved}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">resolved</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm text-gray-400">No performance data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200/50 dark:border-gray-700/50">
              <CardContent>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                  <Activity className="w-4 h-4 text-gray-400" />
                </div>
                {recentActivity.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-4">
                      {recentActivity.slice(0, 6).map((item, i) => (
                        <div key={item._id || i} className="relative flex items-start gap-4 pl-1">
                          <div className={`relative z-10 w-3.5 h-3.5 rounded-full mt-1.5 border-2 border-white dark:border-gray-900 ${
                            item.status === 'resolved' || item.status === 'closed' ? 'bg-emerald-500' :
                            item.status === 'in_progress' ? 'bg-blue-500' :
                            item.status === 'open' ? 'bg-amber-500' :
                            'bg-gray-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link to={`/dashboard/incidents/${item.incidentId || item._id}`} className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                {item.incidentId || `INC-${String(item._id || '').slice(-4).toUpperCase()}`}
                              </Link>
                              <Badge variant={getStatusVariant(item.status)}>{item.status?.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(item.createdAt || item.updatedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm text-gray-400">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-gray-200/50 dark:border-gray-700/50">
              <CardContent>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link to="/dashboard/incidents/new">
                    <div className="group relative overflow-hidden rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-5 transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                          <PlusCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Create Incident</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Report a new issue</p>
                        </div>
                      </div>
                      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                  <Link to="/dashboard/assets">
                    <div className="group relative overflow-hidden rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-5 transition-all hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">View Assets</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your inventory</p>
                        </div>
                      </div>
                      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                  <Link to="/dashboard/knowledge">
                    <div className="group relative overflow-hidden rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-5 transition-all hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-500/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Knowledge Base</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Search articles & guides</p>
                        </div>
                      </div>
                      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
