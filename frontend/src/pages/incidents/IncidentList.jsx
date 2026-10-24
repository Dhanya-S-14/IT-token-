import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { incidentService } from '../../services/incidentService';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatDate, getStatusColor, getPriorityColor, cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, AlertCircle, Eye } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'network', label: 'Network' },
  { value: 'security', label: 'Security' },
  { value: 'vpn', label: 'VPN' },
  { value: 'email', label: 'Email' },
  { value: 'server', label: 'Server' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'other', label: 'Other' },
];

const PAGE_SIZE = 10;

function SortIcon({ direction }) {
  if (direction === 'asc') return <ArrowUp className="w-3.5 h-3.5 ml-1 shrink-0" />;
  if (direction === 'desc') return <ArrowDown className="w-3.5 h-3.5 ml-1 shrink-0" />;
  return <ArrowUpDown className="w-3.5 h-3.5 ml-1 shrink-0 opacity-40" />;
}

export default function IncidentList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => ({
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined,
    sort: sortField,
    order: sortDirection,
    page,
    limit: PAGE_SIZE,
  }), [search, statusFilter, priorityFilter, categoryFilter, sortField, sortDirection, page]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['incidents', queryParams],
    queryFn: () => incidentService.getAll(queryParams),
  });

  const incidents = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.page || page;
  const totalCount = data?.data?.total || 0;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const getStatusVariant = (status) => {
    const map = { open: 'info', in_progress: 'warning', resolved: 'success', closed: 'secondary' };
    return map[status] || 'default';
  };

  function getPriorityLabel(p) {
    return p ? p.charAt(0).toUpperCase() + p.slice(1) : '';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Incidents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalCount > 0 ? `${totalCount} total incidents` : 'Manage and track incidents'}
          </p>
        </div>
        <Link to="/dashboard/incidents/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Incident
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or ID..."
                value={search}
                onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
              className="w-full lg:w-44"
            />
            <Select
              options={PRIORITY_OPTIONS}
              value={priorityFilter}
              onChange={(e) => handleFilterChange(setPriorityFilter)(e.target.value)}
              className="w-full lg:w-44"
            />
            <Select
              options={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={(e) => handleFilterChange(setCategoryFilter)(e.target.value)}
              className="w-full lg:w-44"
            />
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} cols={8} />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Failed to load incidents</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{error?.message || 'An unexpected error occurred'}</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No incidents found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {search || statusFilter || priorityFilter || categoryFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first incident'}
              </p>
              {!search && !statusFilter && !priorityFilter && !categoryFilter && (
                <Link to="/dashboard/incidents/new">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Incident
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th
                        className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => handleSort('incidentId')}
                      >
                        <div className="flex items-center">
                          Incident ID
                          <SortIcon direction={sortField === 'incidentId' ? sortDirection : null} />
                        </div>
                      </th>
                      <th
                        className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          Title
                          <SortIcon direction={sortField === 'title' ? sortDirection : null} />
                        </div>
                      </th>
                      <th
                        className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => handleSort('priority')}
                      >
                        <div className="flex items-center">
                          Priority
                          <SortIcon direction={sortField === 'priority' ? sortDirection : null} />
                        </div>
                      </th>
                      <th
                        className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon direction={sortField === 'status' ? sortDirection : null} />
                        </div>
                      </th>
                      <th
                        className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center">
                          Category
                          <SortIcon direction={sortField === 'category' ? sortDirection : null} />
                        </div>
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Assigned To
                      </th>
                      <th
                        className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          Created Date
                          <SortIcon direction={sortField === 'createdAt' ? sortDirection : null} />
                        </div>
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident, index) => (
                      <tr
                        key={incident._id}
                        className={cn(
                          'border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
                          index % 2 === 0 && 'bg-transparent',
                          index % 2 !== 0 && 'bg-gray-50/50 dark:bg-gray-800/20'
                        )}
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/dashboard/incidents/${incident._id}`}
                            className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {incident.incidentId || `INC-${String(incident._id).slice(-4).toUpperCase()}`}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/dashboard/incidents/${incident._id}`}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                          >
                            {incident.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getPriorityColor(incident.priority))}>
                            {getPriorityLabel(incident.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusVariant(incident.status)}>
                            {incident.status?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{incident.category || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {incident.assignedTo?.name || incident.assignedTo?.email || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(incident.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/dashboard/incidents/${incident._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-[36px]"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
