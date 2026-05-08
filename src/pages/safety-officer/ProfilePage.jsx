import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Mail, Phone, Building, ShieldCheck } from 'lucide-react';

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/update-profile', profile);
      updateUser(data.user);
      toast.success('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwords.currentPassword) errs.currentPassword = 'Required';
    if (!passwords.newPassword) errs.newPassword = 'Required';
    else if (passwords.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (passwords.newPassword !== passwords.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setSavingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto flex flex-col gap-5">
      <h1 className="text-xl font-bold text-gray-800">My Profile</h1>

      {/* Avatar + Name Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {getInitials(user?.name)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-gray-500 capitalize">Safety Officer</span>
                {user?.isApproved && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                    ✓ Approved
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setEditing(!editing); setShowPasswordSection(false); }}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
            style={{
              borderColor: '#10b981',
              color: '#10b981',
              background: editing ? '#f0fdf4' : 'white',
            }}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Read-only info grid */}
        {!editing && (
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
              <ShieldCheck size={16} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Account ID</p>
                <p className="text-sm font-medium text-gray-700 font-mono truncate">{user?._id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-gray-50"
                style={{ '--tw-ring-color': '#10b981' }}
                placeholder="Your full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Department</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-gray-50"
                  placeholder="e.g. Safety"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-gray-50"
                  placeholder="+1-555-0100"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white"
                style={{ background: '#10b981' }}
              >
                {savingProfile && (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Change Password</h3>
          <button
            onClick={() => { setShowPasswordSection(!showPasswordSection); setEditing(false); }}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
            style={{
              borderColor: '#10b981',
              color: '#10b981',
              background: showPasswordSection ? '#f0fdf4' : 'white',
            }}
          >
            {showPasswordSection ? 'Cancel' : 'Change'}
          </button>
        </div>

        {!showPasswordSection && (
          <p className="text-xs text-gray-400 mt-2">Keep your account secure with a strong password.</p>
        )}

        {showPasswordSection && (
          <form onSubmit={handlePasswordSave} className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current Password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none bg-gray-50 ${pwErrors.currentPassword ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="••••••••"
              />
              {pwErrors.currentPassword && <p className="mt-1 text-xs text-red-500">{pwErrors.currentPassword}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">New Password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none bg-gray-50 ${pwErrors.newPassword ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Min 6 characters"
                />
                {pwErrors.newPassword && <p className="mt-1 text-xs text-red-500">{pwErrors.newPassword}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none bg-gray-50 ${pwErrors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Repeat new password"
                />
                {pwErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{pwErrors.confirmPassword}</p>}
              </div>
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white"
              style={{ background: '#10b981' }}
            >
              {savingPassword && (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Account Information</h3>
        <div className="space-y-1">
          {[
            { label: 'Account ID', value: user?._id, mono: true },
            { label: 'Role', value: 'Safety Officer' },
            { label: 'Account Status', value: 'Active & Approved', green: true },
            ...(user?.lastLogin ? [{ label: 'Last Login', value: new Date(user.lastLogin).toLocaleString() }] : []),
          ].map(({ label, value, mono, green }) => (
            <div
              key={label}
              className="flex justify-between items-center py-2"
              style={{ borderBottom: '1px solid #f3f4f6' }}
            >
              <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
              <span className={`text-xs font-medium ${green ? 'text-green-600' : 'text-gray-700'} ${mono ? 'font-mono' : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;