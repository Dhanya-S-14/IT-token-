import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import AdminLogin from './pages/auth/AdminLogin';
import EmployeeLogin from './pages/auth/EmployeeLogin';
import EmployeeRegister from './pages/auth/EmployeeRegister';
import AdminLayout from './components/layout/AdminLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';

import AdminDashboard from './pages/admin/Dashboard';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import DeploymentManagement from './pages/admin/DeploymentManagement';
import Reports from './pages/admin/Reports';
import ActivityLog from './pages/admin/ActivityLog';

import EmployeeDashboard from './pages/employee/Dashboard';
import RaiseComplaint from './pages/employee/RaiseComplaint';
import MyComplaints from './pages/employee/MyComplaints';
import ComplaintDetail from './pages/employee/ComplaintDetail';
import EmployeeProfile from './pages/employee/Profile';
import AICopilotView from './pages/ai/AICopilotView';

const ProtectedRoute = ({ children, type }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!user) return <Navigate to="/" replace />;
  const isAdmin = !!user.adminId;
  if (type === 'admin' && !isAdmin) return <Navigate to="/employee/dashboard" replace />;
  if (type === 'employee' && isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/employee" element={<EmployeeLogin />} />
      <Route path="/register/employee" element={<EmployeeRegister />} />

      <Route path="/admin" element={<ProtectedRoute type="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="ai-copilot" element={<AICopilotView />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="complaints" element={<ComplaintManagement />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="deployments" element={<DeploymentManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="activity" element={<ActivityLog />} />
      </Route>

      <Route path="/employee" element={<ProtectedRoute type="employee"><EmployeeLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="ai-copilot" element={<AICopilotView />} />
        <Route path="raise-complaint" element={<RaiseComplaint />} />
        <Route path="my-complaints" element={<MyComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="profile" element={<EmployeeProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '8px', background: '#333', color: '#fff' } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
