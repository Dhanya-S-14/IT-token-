import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PlusCircle, CheckCircle, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import LogoIcon from '../illustrations/LogoIcon';
import NotificationDropdown from '../ui/NotificationDropdown';
import AICopilotWidget from '../ai/AICopilotWidget';

const employeeNav = [
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/ai-copilot', icon: Sparkles, label: 'AI Copilot' },
  { to: '/employee/raise-complaint', icon: PlusCircle, label: 'Raise Complaint' },
  { to: '/employee/my-complaints', icon: CheckCircle, label: 'My Complaints' },
  { to: '/employee/profile', icon: User, label: 'Profile' },
];

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login/employee');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} nav={employeeNav} onLogout={handleLogout} user={user} />
      <Sidebar nav={employeeNav} onLogout={handleLogout} user={user} />
      <div className="lg:pl-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} user={user} onLogout={handleLogout} />
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
      <AICopilotWidget />
    </div>
  );
}

function Sidebar({ nav, onLogout, user }) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="w-8 h-8" />
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">OpsPulse</span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">Employee Portal</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/employee/dashboard'} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">{user?.name?.[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.employeeId}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}

function MobileSidebar({ open, onClose, nav, onLogout, user }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
          <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <LogoIcon className="w-7 h-7" />
                <span className="font-bold text-gray-900 dark:text-white">OpsPulse</span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <nav className="p-4 space-y-1">
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/employee/dashboard'} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <item.icon className="w-5 h-5" /> {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={onLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><LogOut className="w-4 h-4" /> Logout</button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function TopBar({ onMenuClick, user, onLogout }) {
  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-3 ml-auto">
          <NotificationDropdown />
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.employeeId}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">{user?.name?.[0]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
