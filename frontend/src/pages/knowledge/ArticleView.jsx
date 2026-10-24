import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Wifi, Monitor, FileText } from 'lucide-react';

const articles = [
  { _id: 'k1', title: 'How to reset your password', category: 'guide', body: '## Step 1: Go to Login Page\nNavigate to the OpsPulse login page and click "Forgot Password" link below the login form.\n\n## Step 2: Enter Your Email\nProvide the email address associated with your OpsPulse account. A password reset link will be sent to your inbox.\n\n## Step 3: Check Your Email\nOpen the email from OpsPulse and click the password reset link. This link expires within 1 hour.\n\n## Step 4: Set New Password\nEnter your new password. It must be at least 8 characters long and contain a mix of letters, numbers, and special characters.\n\n## Step 5: Log In\nUse your new password to log in to OpsPulse.', tags: ['password', 'account', 'security'], author: 'Admin', updatedAt: '2026-07-01', icon: Shield },
  { _id: 'k2', title: 'Setting up VPN for remote work', category: 'tutorial', body: '## Prerequisites\n- GlobalProtect VPN client installed on your device\n- Active OpsPulse account with VPN access\n- Company-issued laptop or approved personal device\n\n## Windows Setup\n1. Download GlobalProtect from the software portal\n2. Install the client with default settings\n3. Enter the portal address: vpn.opspulse.com\n4. Log in with your company credentials\n\n## macOS Setup\n1. Open Self Service app\n2. Search for "GlobalProtect"\n3. Click Install\n4. Open GlobalProtect from Applications\n5. Enter portal: vpn.opspulse.com\n\n## Connection Tips\n- Ensure you are connected to a stable internet connection\n- If connection fails, try restarting the client\n- Contact IT if you receive "Portal unreachable" error', tags: ['vpn', 'remote', 'network'], author: 'IT Team', updatedAt: '2026-06-28', icon: Wifi },
  { _id: 'k3', title: 'Network printer installation guide', category: 'guide', body: '## Windows\n1. Go to Settings > Bluetooth & Devices > Printers & Scanners\n2. Click "Add Device"\n3. Select "Add a network printer"\n4. Choose your printer from the list\n5. Wait for driver installation to complete\n\n## Mac\n1. Open System Settings > Printers & Scanners\n2. Click the + button\n3. Select the printer from the list\n4. Choose the correct driver\n5. Click Add\n\n## Troubleshooting\n- Ensure you are connected to the corporate network\n- Check if the printer shows online status\n- Restart the print spooler service if jobs are stuck', tags: ['printer', 'hardware', 'setup'], author: 'Bob Johnson', updatedAt: '2026-06-25', icon: Monitor },
  { _id: 'k4', title: 'Incident reporting best practices', category: 'documentation', body: '## When to Report an Incident\nReport any issue that disrupts your ability to work, including:\n- System outages or performance degradation\n- Hardware malfunctions\n- Software errors or crashes\n- Security concerns (phishing, unauthorized access)\n- Network connectivity problems\n\n## How to Write a Good Incident Report\n1. **Title**: Clear and concise description of the issue\n2. **Description**: Include what happened, when, and what you were doing\n3. **Steps to Reproduce**: If applicable, list steps that lead to the issue\n4. **Impact**: Describe how this affects your work\n5. **Screenshots**: Attach relevant screenshots if available\n\n## Priority Guidelines\n- **Critical**: Service outage affecting all users\n- **High**: Major feature broken for multiple users\n- **Medium**: Single user impacted with workaround available\n- **Low**: Minor issue, cosmetic, or enhancement request', tags: ['incident', 'best-practices'], author: 'Alice Smith', updatedAt: '2026-06-20', icon: FileText },
  { _id: 'k5', title: 'Software request approval process', category: 'documentation', body: '## Request Process\n1. Submit a request through the OpsPulse portal\n2. Include the software name, version, and business justification\n3. Your manager will receive an approval notification\n4. IT reviews the request for compatibility and licensing\n5. Approved requests are processed within 2-3 business days\n\n## Approved Software Categories\n- Productivity tools (Microsoft Office, Adobe)\n- Development tools (VS Code, Git, Docker)\n- Communication tools (Slack, Teams, Zoom)\n- Security tools (antivirus, VPN clients)\n\n## Restrictions\n- No unauthorized SaaS purchases\n- All software must be approved by IT Security\n- Open source tools require legal review for commercial use', tags: ['software', 'request', 'procurement'], author: 'Admin', updatedAt: '2026-06-15', icon: FileText },
  { _id: 'k6', title: 'Data backup and recovery procedures', category: 'guide', body: '## Backup Schedule\n- **Critical servers**: Every 4 hours\n- **File servers**: Daily at 10 PM\n- **Databases**: Transaction logs every 15 minutes\n- **End-user devices**: Not backed up automatically (use OneDrive)\n\n## Requesting Data Recovery\n1. Submit an incident with category "Data Recovery"\n2. Specify the file/folder path and date/time to restore from\n3. Provide business justification\n4. Typical recovery time: 2-4 hours\n\n## Retention Policy\n- Daily backups: 30 days\n- Weekly backups: 3 months\n- Monthly backups: 12 months\n- Yearly backups: 7 years\n\n## Self-Service Recovery\nUsers can recover their own files from OneDrive recycle bin (30-day retention). For server data, contact the IT team.', tags: ['backup', 'recovery', 'data'], author: 'IT Team', updatedAt: '2026-06-10', icon: Shield },
];

const categoryColors = { guide: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', tutorial: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400', documentation: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' };

export default function ArticleView() {
  const { id } = useParams();
  const article = articles.find(a => a._id === id);

  if (!article) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
        <Link to="/dashboard/knowledge" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 inline-block"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
        <Card><CardContent><div className="flex flex-col items-center justify-center py-16"><FileText className="w-12 h-12 text-gray-400 mb-4" /><p className="text-gray-500 dark:text-gray-400">Article not found</p><Link to="/dashboard/knowledge" className="mt-4"><Button variant="outline">Back to Knowledge Base</Button></Link></div></CardContent></Card>
      </motion.div>
    );
  }

  const lines = article.body.split('\n');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8 max-w-4xl mx-auto">
      <Link to="/dashboard/knowledge" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 inline-flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
      </Link>

      <Card>
        <CardContent>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/5 text-primary"><FileText className="w-6 h-6" /></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={categoryColors[article.category] || 'bg-gray-50 text-gray-700'}>{article.category}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{article.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{article.author}</span>
                <span>·</span>
                <span>Updated {article.updatedAt}</span>
              </div>
              <div className="flex gap-1.5 mt-3">
                {article.tags.map(t => <span key={t} className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full px-2 py-0.5">{t}</span>)}
              </div>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            {lines.map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3">{line.replace('## ', '')}</h2>;
              if (line.startsWith('- ')) return <li key={i} className="text-sm text-gray-700 dark:text-gray-300 ml-4 list-disc">{line.replace('- ', '')}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>;
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
