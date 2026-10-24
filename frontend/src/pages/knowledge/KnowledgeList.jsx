import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Search, BookOpen, FileText, Monitor, Shield, Wifi } from 'lucide-react';

const articles = [
  { _id: 'k1', title: 'How to reset your password', category: 'guide', summary: 'Step-by-step instructions for resetting your OpsPulse account password.', tags: ['password', 'account', 'security'], author: 'Admin', updatedAt: '2026-07-01', icon: Shield },
  { _id: 'k2', title: 'Setting up VPN for remote work', category: 'tutorial', summary: 'Configure and connect to the corporate VPN from your home network.', tags: ['vpn', 'remote', 'network'], author: 'IT Team', updatedAt: '2026-06-28', icon: Wifi },
  { _id: 'k3', title: 'Network printer installation guide', category: 'guide', summary: 'How to add network printers to your Windows or Mac workstation.', tags: ['printer', 'hardware', 'setup'], author: 'Bob Johnson', updatedAt: '2026-06-25', icon: Monitor },
  { _id: 'k4', title: 'Incident reporting best practices', category: 'documentation', summary: 'Guidelines for creating effective incident reports with the right level of detail.', tags: ['incident', 'best-practices'], author: 'Alice Smith', updatedAt: '2026-06-20', icon: FileText },
  { _id: 'k5', title: 'Software request approval process', category: 'documentation', summary: 'How to request new software licenses and the approval workflow.', tags: ['software', 'request', 'procurement'], author: 'Admin', updatedAt: '2026-06-15', icon: FileText },
  { _id: 'k6', title: 'Data backup and recovery procedures', category: 'guide', summary: 'Understanding the backup schedule and how to request data recovery.', tags: ['backup', 'recovery', 'data'], author: 'IT Team', updatedAt: '2026-06-10', icon: Shield },
];

const categoryColors = {
  guide: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  tutorial: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  documentation: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
};

export default function KnowledgeList() {
  const [search, setSearch] = useState('');

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.summary.toLowerCase().includes(search.toLowerCase()) ||
    a.tags.some(t => t.includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Knowledge Base</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{articles.length} articles</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((article) => {
          const Icon = article.icon;
          return (
            <Link key={article._id} to={`/dashboard/knowledge/${article._id}`}>
              <Card className="h-full transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer">
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/5 text-primary shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">{article.title}</h3>
                      <span className={cn('inline-block mt-2 text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5', categoryColors[article.category])}>{article.category}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{article.summary}</p>
                      <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400 dark:text-gray-500">
                        <span>{article.author}</span>
                        <span>·</span>
                        <span>{article.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No articles found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
