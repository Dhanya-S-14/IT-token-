import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analyticsService';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { BarChart3, AlertCircle } from 'lucide-react';

const PIE_COLORS = { Critical: '#EF4444', High: '#F97316', Medium: '#EAB308', Low: '#22C55E' };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</p>
      {payload.map((entry, i) => <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>{entry.name}: {entry.value}</p>)}
    </div>
  );
}

export default function Analytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsService.getDashboard(),
  });

  const dashboardData = data?.data?.data;
  const monthlyTrends = dashboardData?.monthlyTrends || [];
  const priorityDistribution = dashboardData?.priorityDistribution || [];
  const departmentWise = dashboardData?.departmentWise || [];
  const engineerPerformance = dashboardData?.engineerPerformance || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-red-500" /></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load analytics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error?.message || 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Incident trends and performance metrics</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Card key={i}><CardContent><Skeleton className="h-72 w-full" /></CardContent></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">Monthly Incident Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrends.length ? monthlyTrends : [{ month: 'No data', count: 0 }]}>
                  <defs><linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fill="url(#trendGradient)" name="Incidents" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">Priority Distribution</h3>
              <div className="flex items-center justify-center h-[300px]">
                {priorityDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={priorityDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {priorityDistribution.map((entry, i) => <Cell key={i} fill={PIE_COLORS[entry.name] || '#6B7280'} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={value => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-gray-400">No data available</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">Department-wise Incidents</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentWise.length ? departmentWise : [{ department: 'No data', count: 0 }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {departmentWise.map((_, i) => <Cell key={i} fill={['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#EF4444'][i % 7]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">Engineer Performance</h3>
              {engineerPerformance.length > 0 ? (
                <div className="space-y-3">
                  {engineerPerformance.map((eng, i) => (
                    <div key={eng._id || i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-blue-500'}`}>{i + 1}</div>
                        <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{eng.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{eng.role || 'Engineer'}</p></div>
                      </div>
                      <div className="text-right"><p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{eng.resolved}</p><p className="text-xs text-gray-500 dark:text-gray-400">resolved</p></div>
                    </div>
                  ))}
                </div>
              ) : <div className="flex items-center justify-center h-48"><p className="text-sm text-gray-400">No performance data</p></div>}
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
