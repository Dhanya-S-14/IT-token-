import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatDate, cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Plus, Search, Monitor, Laptop, Server, Printer, Wifi } from 'lucide-react';

const assets = [
  { _id: 'a1', assetId: 'AST-001', name: 'Dell Latitude 5540', type: 'laptop', status: 'active', assignedTo: 'Alice Smith', location: 'Floor 3 - Cubicle 12', purchaseDate: '2025-06-15', warrantyExpiry: '2028-06-15' },
  { _id: 'a2', assetId: 'AST-002', name: 'HP LaserJet Pro M404', type: 'printer', status: 'active', assignedTo: 'Finance Dept', location: 'Floor 2 - Print Room', purchaseDate: '2024-03-10', warrantyExpiry: '2027-03-10' },
  { _id: 'a3', assetId: 'AST-003', name: 'Cisco Catalyst 9300', type: 'network', status: 'active', assignedTo: 'IT Team', location: 'Server Room A', purchaseDate: '2025-01-20', warrantyExpiry: '2030-01-20' },
  { _id: 'a4', assetId: 'AST-004', name: 'Dell PowerEdge R750', type: 'server', status: 'active', assignedTo: 'IT Team', location: 'Server Room B', purchaseDate: '2025-09-01', warrantyExpiry: '2030-09-01' },
  { _id: 'a5', assetId: 'AST-005', name: 'MacBook Pro M3', type: 'laptop', status: 'active', assignedTo: 'Sarah Lee', location: 'Floor 4 - Cubicle 7', purchaseDate: '2026-02-01', warrantyExpiry: '2029-02-01' },
  { _id: 'a6', assetId: 'AST-006', name: 'Ubiquiti UniFi AP', type: 'network', status: 'maintenance', assignedTo: 'IT Team', location: 'Floor 1 - Conference Hall', purchaseDate: '2024-11-15', warrantyExpiry: '2027-11-15' },
  { _id: 'a7', assetId: 'AST-007', name: 'Lenovo ThinkCentre M90a', type: 'desktop', status: 'active', assignedTo: 'Reception', location: 'Ground Floor - Front Desk', purchaseDate: '2025-04-10', warrantyExpiry: '2028-04-10' },
  { _id: 'a8', assetId: 'AST-008', name: 'Dell UltraSharp U2723QE', type: 'monitor', status: 'active', assignedTo: 'Bob Johnson', location: 'Floor 3 - Cubicle 15', purchaseDate: '2026-01-05', warrantyExpiry: '2029-01-05' },
  { _id: 'a9', assetId: 'AST-009', name: 'Synology DS1823xs+', type: 'server', status: 'active', assignedTo: 'IT Team', location: 'Server Room A', purchaseDate: '2025-07-20', warrantyExpiry: '2030-07-20' },
  { _id: 'a10', assetId: 'AST-010', name: 'HP EliteBook 840 G10', type: 'laptop', status: 'retired', assignedTo: '—', location: 'Storage', purchaseDate: '2023-02-15', warrantyExpiry: '2026-02-15' },
];

const typeIcons = { laptop: Laptop, desktop: Monitor, server: Server, printer: Printer, network: Wifi, monitor: Monitor };

function getTypeIcon(type) {
  const Icon = typeIcons[type] || Monitor;
  return <Icon className="w-5 h-5" />;
}

function getStatusVariant(status) {
  const map = { active: 'success', maintenance: 'warning', retired: 'secondary' };
  return map[status] || 'default';
}

export default function AssetList() {
  const [search, setSearch] = useState('');

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.assetId.toLowerCase().includes(search.toLowerCase()) ||
    a.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{assets.length} total assets</p>
        </div>
        <Link to="/dashboard/assets/new">
          <Button><Plus className="w-4 h-4 mr-2" />Add Asset</Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Asset ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Assigned To</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Location</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a._id} className={cn('border-b border-gray-100 dark:border-gray-800', i % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-gray-800/20')}>
                    <td className="px-6 py-4 text-xs font-mono font-medium text-blue-600 dark:text-blue-400">{a.assetId}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="text-gray-400">{getTypeIcon(a.type)}</span><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.name}</span></div></td>
                    <td className="px-6 py-4 text-sm capitalize text-gray-600 dark:text-gray-400">{a.type}</td>
                    <td className="px-6 py-4"><Badge variant={getStatusVariant(a.status)}>{a.status}</Badge></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{a.assignedTo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{a.location}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-400">No assets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
