import { useAuth } from '../../context/AuthContext';
import { HardHat } from 'lucide-react';
import { formatRole } from '../../utils/formatters';

const WelcomeCard = ({ onReportClick }) => {
  const { user } = useAuth();
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  return (
    <div className="bg-yellow-400 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-yellow-800 text-sm font-medium">{getGreeting()},</p>
          <h2 className="text-2xl font-black text-gray-900 mt-1">{user?.name}</h2>
          <p className="text-yellow-700 text-sm mt-1">{formatRole(user?.role)} • {user?.department || 'HSE System'}</p>
        </div>
        <div className="bg-gray-900/20 p-4 rounded-2xl">
          <HardHat size={36} className="text-gray-900" />
        </div>
      </div>
      <button
        onClick={onReportClick}
        className="mt-5 bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm"
      >
        + Report Incident
      </button>
    </div>
  );
};
export default WelcomeCard;