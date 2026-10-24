import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

export const defaultUser = {
  _id: 'admin1',
  name: 'Admin User',
  email: 'admin@opspulse.com',
  role: 'admin',
};

export const defaultAuth = {
  user: defaultUser,
  loading: false,
  isAdmin: true,
  isManager: false,
  isEngineer: false,
  isEmployee: false,
  hasRole: (...roles) => defaultUser && roles.includes(defaultUser.role),
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function createWrapper({ initialEntries = ['/dashboard/incidents'] } = {}) {
  const queryClient = createQueryClient();

  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export function mockIncidents() {
  return [
    {
      _id: 'inc1',
      incidentId: 'INC-001',
      title: 'Server down - production database',
      description: 'Production database server is unresponsive',
      status: 'open',
      priority: 'critical',
      category: 'server',
      assignedTo: { _id: 'eng1', name: 'John Engineer', email: 'john@opspulse.com' },
      createdBy: { _id: 'emp1', name: 'Jane Employee' },
      department: { _id: 'dept1', name: 'Engineering' },
      createdAt: '2026-07-01T10:00:00Z',
      comments: [],
      timeline: [],
    },
    {
      _id: 'inc2',
      incidentId: 'INC-002',
      title: 'Email service outage',
      description: 'Can not send or receive emails',
      status: 'in_progress',
      priority: 'high',
      category: 'email',
      assignedTo: { _id: 'eng2', name: 'Sarah Engineer', email: 'sarah@opspulse.com' },
      createdBy: { _id: 'emp2', name: 'Bob Employee' },
      department: { _id: 'dept2', name: 'IT' },
      createdAt: '2026-07-02T14:00:00Z',
      comments: [{ _id: 'c1', text: 'Looking into this', author: 'John Engineer', createdAt: '2026-07-02T15:00:00Z' }],
      timeline: [{ type: 'created', action: 'Incident created', performedBy: { name: 'Bob Employee' }, createdAt: '2026-07-02T14:00:00Z' }],
    },
    {
      _id: 'inc3',
      incidentId: 'INC-003',
      title: 'VPN connection issues',
      description: 'Remote users cannot connect to VPN',
      status: 'resolved',
      priority: 'medium',
      category: 'vpn',
      assignedTo: null,
      createdBy: { _id: 'emp1', name: 'Jane Employee' },
      department: { _id: 'dept1', name: 'Engineering' },
      createdAt: '2026-06-28T09:00:00Z',
      comments: [],
      timeline: [],
    },
  ];
}

export function mockDepartments() {
  return [
    { _id: 'dept1', name: 'Engineering' },
    { _id: 'dept2', name: 'IT' },
    { _id: 'dept3', name: 'HR' },
  ];
}

export function mockEngineers() {
  return [
    { _id: 'eng1', name: 'John Engineer', email: 'john@opspulse.com', role: 'engineer' },
    { _id: 'eng2', name: 'Sarah Engineer', email: 'sarah@opspulse.com', role: 'engineer' },
  ];
}

export function mockSla() {
  return {
    _id: 'sla1',
    incidentId: 'inc1',
    status: 'active',
    deadline: new Date(Date.now() + 7200000).toISOString(),
    policy: 'P1 - 4 hours',
  };
}
