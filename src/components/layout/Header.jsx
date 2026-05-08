import { useAuth } from '../../context/AuthContext';
import { formatRole } from '../../utils/formatters';
import { Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Role-based theme ──────────────────────────────────────────────────────────
const THEME = {
  worker:         { accent: 'text-yellow-400', ring: 'bg-yellow-400', text: 'text-gray-900' },
  supervisor: { accent: 'text-blue-400', ring: 'bg-blue-500', text: 'text-white' },
  safety_officer: { accent: 'text-green-400',  ring: 'bg-green-400',  text: 'text-gray-900' },
  management:     { accent: 'text-red-400',    ring: 'bg-red-500',    text: 'text-white'    },
};

// ── Notification path per role ────────────────────────────────────────────────
const getNotificationPath = (role) => {
  switch (role) {
    case 'worker':         return '/worker/notifications';
    case 'safety_officer': return '/safety-officer/notifications';
    case 'supervisor':     return '/supervisor/notifications';
    case 'management':     return '/management/notifications';
    default:               return '/worker/notifications';
  }
};

const Header = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = THEME[user?.role] || THEME.worker;

  return (
    <header className="h-16 bg-gray-900 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
      <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-gray-400">
        <Menu size={20} />
      </button>

      <div className="hidden lg:block">
        <p className="text-white font-semibold text-sm">
          Welcome back, <span className={theme.accent}>{user?.name?.split(' ')[0]}</span>
        </p>
        <p className="text-xs text-gray-400">{formatRole(user?.role)}</p>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => navigate(getNotificationPath(user?.role))}
          className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors relative"
        >
          <Bell size={20} />
        </button>
        <div className={`w-8 h-8 rounded-full ${theme.ring} flex items-center justify-center ${theme.text} text-xs font-black`}>
          {user?.name?.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;