import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, Building, BadgeCheck } from 'lucide-react';

const LEVEL_COLORS = {
  junior:  'bg-gray-100 text-gray-600',
  mid:     'bg-blue-100 text-blue-700',
  senior:  'bg-purple-100 text-purple-700',
  expert:  'bg-yellow-100 text-yellow-700',
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto flex flex-col gap-5">

      <h1 className="text-xl font-bold text-gray-800">My Profile</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </span>
              {user?.experienceLevel && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${LEVEL_COLORS[user.experienceLevel]}`}>
                  {user.experienceLevel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-700">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-700">{user?.phone || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Building size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Department</p>
              <p className="text-sm font-medium text-gray-700">{user?.department || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <BadgeCheck size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Employee ID</p>
              <p className="text-sm font-medium text-gray-700">{user?.employeeId || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;