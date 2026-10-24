import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatDate, cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Search, GitCompare, ArrowUpDown } from 'lucide-react';

const changes = [
  { _id: 'c1', changeId: 'CHG-001', title: 'Upgrade database cluster to v8.0', status: 'approved', priority: 'high', category: 'server', requestedBy: 'Alice Smith', scheduledDate: '2026-07-12', description: 'Upgrade PostgreSQL from v7.4 to v8.0 across all production clusters.' },
  { _id: 'c2', changeId: 'CHG-002', title: 'Deploy new firewall rules', status: 'in_progress', priority: 'critical', category: 'network', requestedBy: 'Bob Johnson', scheduledDate: '2026-07-09', description: 'Implement new ACL rules for zero-trust network access model.' },
  { _id: 'c3', changeId: 'CHG-003', title: 'Office 365 tenant migration', status: 'pending', priority: 'medium', category: 'cloud', requestedBy: 'Sarah Lee', scheduledDate: '2026-07-20', description: 'Migrate all mailboxes from on-prem Exchange to Office 365.' },
  { _id: 'c4', changeId: 'CHG-004', title: 'Patch management - July rollout', status: 'approved', priority: 'high', category: 'software', requestedBy: 'IT Team', scheduledDate: '2026-07-14', description: 'Monthly security patch deployment for all Windows servers.' },
  { _id: 'c5', changeId: 'CHG-005', title: 'Replace UPS in Server Room B', status: 'completed', priority: 'medium', category: 'hardware', requestedBy: 'Facilities', scheduledDate: '2026-07-05', description: 'Replace aging UPS unit with new APC Smart-UPS 3000VA.' },
  { _id: 'c6', changeId: 'CHG-006', title: 'VPN gateway certificate renewal', status: 'pending', priority: 'high', category: 'security', requestedBy: 'Security Team', scheduledDate: '2026-07-18', description: 'Renew expiring SSL certificate on the VPN gateway appliance.' },
  { _id: 'c7', changeId: 'CHG-007', title: 'Migrate file server to cloud', status: 'rejected', priority: 'low', category: 'cloud', requestedBy: 'Finance Dept', scheduledDate: '2026-07-08', description: 'Move on-prem file server to SharePoint Online. Rejected pending security review.' },
  { _id: 'c8', changeId: 'CHG-008', title: 'Deploy monitoring agent update', status: 'completed', priority: 'low', category: 'software', requestedBy: 'DevOps', scheduledDate: '2026-07-02', description: 'Update Datadog agents on all production servers to v7.52.' },
];

function getStatusVariant(status) {
  const map = { pending: 'warning', approved: 'info', in_progress: 'warning', completed: 'success', rejected: 'destructive' };
  return map[status] || 'default';
}

function getPriorityColor(p) {
  const colors = { critical: 'text-red-600 bg-red-50 dark:bg-red-900/20', high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', low: 'text-green-600 bg-green-50 dark:bg-green-900/20' };
  return colors[p] || colors.low;
}

function getPriorityLabel(p) {
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : '';
}

export default function ChangeList() {
  const [search, setSearch] = useState('');

  const filtered = changes.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.changeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Change Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{changes.length} total changes</p>
      </div>

      <Card>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search changes..." value={search} onChange={e => setSearch(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Change ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Requested By</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c._id} className={cn('border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50', i % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-gray-800/20')}>
                    <td className="px-6 py-4 text-xs font-mono font-medium text-purple-600 dark:text-purple-400">{c.changeId}</td>
                    <td className="px-6 py-4"><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.title}</span></td>
                    <td className="px-6 py-4"><span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getPriorityColor(c.priority))}>{getPriorityLabel(c.priority)}</span></td>
                    <td className="px-6 py-4"><Badge variant={getStatusVariant(c.status)}>{c.status.replace('_', ' ')}</Badge></td>
                    <td className="px-6 py-4 text-sm capitalize text-gray-600 dark:text-gray-400">{c.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{c.requestedBy}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{c.scheduledDate}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-400">No changes found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
