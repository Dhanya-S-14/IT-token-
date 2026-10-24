const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const now = new Date();

const incidents = [
  { _id: '1', incidentId: 'INC-001', title: 'Email server down', description: 'Outlook not connecting for all users in finance department. Error: Cannot connect to server.', priority: 'critical', status: 'open', category: 'email', assignedTo: null, createdBy: { name: 'John Doe' }, department: { name: 'Finance' }, createdAt: new Date(now - 3600000), updatedAt: now, comments: [] },
  { _id: '2', incidentId: 'INC-002', title: 'VPN connection issues', description: 'Remote users unable to establish VPN connection since the latest patch.', priority: 'high', status: 'in_progress', category: 'vpn', assignedTo: { _id: 'e1', name: 'Alice Smith', email: 'alice@opspulse.com' }, createdBy: { name: 'Jane Roe' }, department: { name: 'HR' }, createdAt: new Date(now - 7200000), updatedAt: now, comments: [{ text: 'Looking into the VPN gateway logs', author: 'Alice Smith', createdAt: new Date(now - 1800000) }] },
  { _id: '3', incidentId: 'INC-003', title: 'Printer not working', description: 'Network printer on floor 3 is showing offline status.', priority: 'low', status: 'resolved', category: 'hardware', assignedTo: { _id: 'e2', name: 'Bob Johnson', email: 'bob@opspulse.com' }, createdBy: { name: 'Mike Brown' }, department: { name: 'Operations' }, createdAt: new Date(now - 86400000), updatedAt: new Date(now - 3600000), comments: [{ text: 'Restarted printer spooler and cleared queue', author: 'Bob Johnson', createdAt: new Date(now - 7200000) }] },
  { _id: '4', incidentId: 'INC-004', title: 'Database performance degradation', description: 'Queries taking 10x longer than normal on the production database.', priority: 'critical', status: 'in_progress', category: 'server', assignedTo: { _id: 'e1', name: 'Alice Smith', email: 'alice@opspulse.com' }, createdBy: { name: 'Sarah Lee' }, department: { name: 'Engineering' }, createdAt: new Date(now - 1800000), updatedAt: now, comments: [] },
  { _id: '5', incidentId: 'INC-005', title: 'New employee laptop setup', description: 'Need to provision and configure a new laptop for the incoming developer.', priority: 'medium', status: 'open', category: 'hardware', assignedTo: null, createdBy: { name: 'Tom Wilson' }, department: { name: 'Engineering' }, createdAt: new Date(now - 14400000), updatedAt: now, comments: [] },
  { _id: '6', incidentId: 'INC-006', title: 'SaaS login integration failing', description: 'SSO login through Azure AD is returning errors for the CRM platform.', priority: 'high', status: 'closed', category: 'software', assignedTo: { _id: 'e2', name: 'Bob Johnson', email: 'bob@opspulse.com' }, createdBy: { name: 'Emma Davis' }, department: { name: 'Sales' }, createdAt: new Date(now - 172800000), updatedAt: new Date(now - 86400000), comments: [{ text: 'Reconfigured Azure AD app registration', author: 'Bob Johnson', createdAt: new Date(now - 86400000) }] },
  { _id: '7', incidentId: 'INC-007', title: 'WiFi connectivity issues in conference room', description: 'Users reporting intermittent WiFi drops in the main conference room.', priority: 'low', status: 'open', category: 'network', assignedTo: null, createdBy: { name: 'Lisa Chen' }, department: { name: 'Marketing' }, createdAt: new Date(now - 21600000), updatedAt: now, comments: [] },
  { _id: '8', incidentId: 'INC-008', title: 'Security vulnerability scan results', description: 'Critical vulnerabilities found in the web application. Need immediate patching.', priority: 'critical', status: 'in_progress', category: 'security', assignedTo: { _id: 'e1', name: 'Alice Smith', email: 'alice@opspulse.com' }, createdBy: { name: 'Security Team' }, department: { name: 'IT' }, createdAt: new Date(now - 3600000), updatedAt: now, comments: [{ text: 'Applying patches to staging first', author: 'Alice Smith', createdAt: new Date(now - 1200000) }] },
  { _id: '9', incidentId: 'INC-009', title: 'Cloud storage quota exceeded', description: 'S3 bucket storage at 95% capacity. Need to archive old data.', priority: 'medium', status: 'resolved', category: 'cloud', assignedTo: { _id: 'e2', name: 'Bob Johnson', email: 'bob@opspulse.com' }, createdBy: { name: 'DevOps Team' }, department: { name: 'Engineering' }, createdAt: new Date(now - 259200000), updatedAt: new Date(now - 172800000), comments: [] },
];

const engineers = [
  { _id: 'e1', name: 'Alice Smith', email: 'alice@opspulse.com', role: 'engineer' },
  { _id: 'e2', name: 'Bob Johnson', email: 'bob@opspulse.com', role: 'engineer' },
  { _id: 'e3', name: 'Charlie Brown', email: 'charlie@opspulse.com', role: 'engineer' },
];

const departments = [
  { _id: 'd1', name: 'Engineering' },
  { _id: 'd2', name: 'HR' },
  { _id: 'd3', name: 'Finance' },
  { _id: 'd4', name: 'Marketing' },
  { _id: 'd5', name: 'Operations' },
  { _id: 'd6', name: 'Sales' },
  { _id: 'd7', name: 'IT' },
];

const mockUser = { _id: 'u1', name: 'Admin User', email: 'admin@opspulse.com', role: 'admin' };
const mockTokens = { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, data: { user: mockUser, ...mockTokens } });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, data: { user: mockUser, ...mockTokens } });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, data: mockUser });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, data: {} });
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({ success: true, data: mockTokens });
});

app.get('/api/incidents', (req, res) => {
  let filtered = [...incidents];
  const { search, status, priority, category, sort, order, page = 1, limit = 10 } = req.query;

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(i => i.title.toLowerCase().includes(s) || (i.incidentId && i.incidentId.toLowerCase().includes(s)));
  }
  if (status) filtered = filtered.filter(i => i.status === status);
  if (priority) filtered = filtered.filter(i => i.priority === priority);
  if (category) filtered = filtered.filter(i => i.category === category);

  if (sort) {
    filtered.sort((a, b) => {
      const aVal = a[sort] || '';
      const bVal = b[sort] || '';
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal > bVal ? 1 : -1;
      return order === 'desc' ? -cmp : cmp;
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / Number(limit));
  const start = (Number(page) - 1) * Number(limit);
  const paginated = filtered.slice(start, start + Number(limit));

  res.json({ success: true, data: paginated, total, page: Number(page), totalPages });
});

app.get('/api/incidents/:id', (req, res) => {
  const inc = incidents.find(i => i._id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, message: 'Incident not found' });
  res.json({ success: true, data: inc });
});

app.post('/api/incidents', (req, res) => {
  const newIncident = { _id: String(incidents.length + 1), incidentId: `INC-${String(incidents.length + 1).padStart(3, '0')}`, ...req.body, status: 'open', assignedTo: null, createdAt: new Date(), updatedAt: new Date(), comments: [] };
  incidents.unshift(newIncident);
  res.json({ success: true, data: newIncident });
});

app.put('/api/incidents/:id', (req, res) => {
  const idx = incidents.findIndex(i => i._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Incident not found' });
  incidents[idx] = { ...incidents[idx], ...req.body, updatedAt: new Date() };
  res.json({ success: true, data: incidents[idx] });
});

app.put('/api/incidents/:id/assign', (req, res) => {
  const inc = incidents.find(i => i._id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, message: 'Incident not found' });
  const engineer = engineers.find(e => e._id === req.body.assignedTo);
  inc.assignedTo = engineer || null;
  inc.updatedAt = new Date();
  res.json({ success: true, data: inc });
});

app.put('/api/incidents/:id/close', (req, res) => {
  const inc = incidents.find(i => i._id === req.params.id);
  if (!inc) return res.status(404).json({ success: false, message: 'Incident not found' });
  inc.status = 'closed';
  inc.updatedAt = new Date();
  res.json({ success: true, data: inc });
});

app.get('/api/departments', (req, res) => {
  res.json({ success: true, data: departments });
});

app.get('/api/users', (req, res) => {
  if (req.query.role === 'engineer') {
    return res.json({ success: true, data: engineers });
  }
  res.json({ success: true, data: engineers });
});

app.get('/api/sla/:incidentId', (req, res) => {
  const inc = incidents.find(i => i._id === req.params.incidentId);
  if (!inc) return res.status(404).json({ success: false, message: 'Not found' });
  const deadline = new Date(new Date(inc.createdAt).getTime() + 4 * 3600000);
  res.json({ success: true, data: { incidentId: req.params.incidentId, status: deadline > new Date() ? 'active' : 'breached', deadline, createdAt: inc.createdAt } });
});

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: [{ _id: 'n1', message: 'New critical incident reported', read: false, createdAt: new Date() }, { _id: 'n2', message: 'SLA breach warning for INC-004', read: false, createdAt: new Date() }] });
});

app.get('/api/analytics/dashboard', (req, res) => {
  const openCount = incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;
  const criticalCount = incidents.filter(i => i.priority === 'critical').length;
  res.json({ success: true, data: { stats: { openIncidents: openCount, criticalIncidents: criticalCount, pendingChanges: 3, slaMet: 92 }, recentActivity: incidents.slice(0, 5), monthlyTrends: [{ month: 'Jan', count: 5 }, { month: 'Feb', count: 8 }, { month: 'Mar', count: 12 }, { month: 'Apr', count: 7 }, { month: 'May', count: 10 }, { month: 'Jun', count: 6 }], priorityDistribution: [{ name: 'Critical', value: 3 }, { name: 'High', value: 2 }, { name: 'Medium', value: 2 }, { name: 'Low', value: 2 }], departmentWise: [{ department: 'Engineering', count: 3 }, { department: 'Finance', count: 1 }, { department: 'HR', count: 1 }, { department: 'Marketing', count: 1 }, { department: 'Operations', count: 1 }, { department: 'Sales', count: 1 }, { department: 'IT', count: 1 }], engineerPerformance: [{ _id: 'e1', name: 'Alice Smith', role: 'Engineer', resolved: 12 }, { _id: 'e2', name: 'Bob Johnson', role: 'Engineer', resolved: 8 }, { _id: 'e3', name: 'Charlie Brown', role: 'Engineer', resolved: 5 }] } });
});

app.listen(5000, () => {
  console.log('Mock API running on http://localhost:5000');
  console.log('Auto-login with: admin@opspulse.com / any password');
});
