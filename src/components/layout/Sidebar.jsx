import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HardHat, LayoutDashboard, FileText, Bell, BarChart2,
  ClipboardList, X, UserCircle, UserCheck, Trophy, ShieldCheck, Users
} from 'lucide-react';

const MENU = {
  worker: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/worker/dashboard' },
    { label: 'My Reports',    icon: FileText,         path: '/worker/reports' },
    { label: 'Safety Buddy',  icon: UserCheck,        path: '/worker/buddy' },
    { label: 'Leaderboard',   icon: Trophy,           path: '/worker/leaderboard' },
    { label: 'Notifications', icon: Bell,             path: '/worker/notifications' },
    { label: 'My Profile',    icon: UserCircle,       path: '/worker/profile' },
  ],
 supervisor: [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/supervisor/dashboard' },
  { label: 'Incidents',   icon: FileText,        path: '/supervisor/incidents' },
  { label: 'Statistics',  icon: BarChart2,       path: '/supervisor/statistics' },
  { label: 'My Team',     icon: Users,           path: '/supervisor/team' },
  { label: 'My Profile',  icon: UserCircle,      path: '/supervisor/profile' },
  { label: 'Buddy Pairs', icon: Users, path: '/supervisor/buddy-pairs' },
],
  safety_officer: [
    { label: 'Dashboard',      icon: LayoutDashboard, path: '/safety-officer/dashboard' },
    { label: 'Assigned Cases', icon: ClipboardList,   path: '/safety-officer/cases' },
    { label: 'Notifications',  icon: Bell,            path: '/safety-officer/notifications' },
    { label: 'My Profile',     icon: UserCircle,      path: '/safety-officer/profile' },
  ],
  management: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/management/dashboard' },
    { label: 'All Incidents', icon: FileText,         path: '/management/incidents' },
    { label: 'Analytics',     icon: BarChart2,        path: '/management/analytics' },
    { label: 'Reports',       icon: ClipboardList,   path: '/management/reports' },
    { label: 'Compliance',    icon: ShieldCheck,      path: '/management/compliance' },
  ],
};

// ── Role-based theme colors ───────────────────────────────────────────────────
const THEME = {
  worker:         { accent: 'bg-yellow-400', text: 'text-gray-900', hover: 'hover:bg-yellow-400/10', ring: 'bg-yellow-400' },
  supervisor: { accent: 'bg-blue-500', text: 'text-white', hover: 'hover:bg-blue-500/10', ring: 'bg-blue-500' },
  safety_officer: { accent: 'bg-green-400',  text: 'text-gray-900', hover: 'hover:bg-green-400/10',  ring: 'bg-green-400'  },
  management:     { accent: 'bg-red-500',    text: 'text-white',    hover: 'hover:bg-red-500/10',    ring: 'bg-red-500'    },
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const menuItems = MENU[user?.role] || [];
  const theme = THEME[user?.role] || THEME.worker;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-white/10 z-30
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className={`${theme.accent} p-1.5 rounded-lg`}>
              <HardHat size={18} className={theme.text} />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">BUILDTECH</p>
              <p className="text-xs text-gray-400 leading-none">HSE System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-white/10 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-3 flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? `${theme.accent} ${theme.text}`
                  : `text-gray-400 hover:bg-white/10 hover:text-white`}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${theme.ring} flex items-center justify-center ${theme.text} text-xs font-black shrink-0`}>
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Logout
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;