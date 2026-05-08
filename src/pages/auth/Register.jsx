import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';
import { registerSchema } from '../../utils/validators';
import ErrorMessage from '../../components/common/ErrorMessage';
import { HardHat } from 'lucide-react';

const ROLES = [
  { value: 'worker',         label: 'Worker' },
  { value: 'supervisor',     label: 'Supervisor' },
  { value: 'safety_officer', label: 'Safety Officer' },
  { value: 'management',     label: 'Management' },
];

const DOMAINS = [
  { value: 'near_miss',       label: '⚠️ Near Miss' },
  { value: 'injury',          label: '🤕 Injury' },
  { value: 'property_damage', label: '🏗️ Property Damage' },
  { value: 'environmental',   label: '🌿 Environmental' },
  { value: 'fire',            label: '🔥 Fire' },
  { value: 'chemical_spill',  label: '⚗️ Chemical Spill' },
  { value: 'other',           label: '📋 Other' },
];

const Register = () => {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm(registerSchema);

  const watchedRole = watch ? watch('role') : selectedRole;
  const currentRole = watchedRole || selectedRole;

  const onSubmit = async (data) => {
    setError('');
    const { confirmPassword, ...submitData } = data;
    const result = await registerUser(submitData);
    if (result.success) {
      setSuccess(
        submitData.role === 'supervisor' || submitData.role === 'safety_officer'
          ? 'Registration submitted! Please wait for management approval.'
          : 'Registration successful! Please verify your email.'
      );
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.message);
    }
  };

  const inp = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 outline-none focus:border-yellow-400 transition-colors";
  const lbl = "text-sm font-medium text-gray-300";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
      style={{ backgroundImage: `repeating-linear-gradient(45deg,rgba(234,179,8,.04) 0,rgba(234,179,8,.04) 1px,transparent 0,transparent 50%)`, backgroundSize: '20px 20px' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-yellow-400 p-3 rounded-2xl mb-4"><HardHat size={32} className="text-gray-900" /></div>
          <h1 className="text-2xl font-black text-white">BUILDTECH HSE</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Register</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <ErrorMessage message={error} />

            {success && (
              <div className="p-3 bg-yellow-400/20 border border-yellow-400/30 rounded-xl text-yellow-300 text-sm">
                {success}
              </div>
            )}

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className={lbl}>Full Name</label>
              <input placeholder="John Doe" {...register('name')} className={inp} />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className={lbl}>Email</label>
              <input type="email" placeholder="you@gmail.com" {...register('email')} className={inp} />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1">
              <label className={lbl}>Role</label>
              <select
                {...register('role')}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={inp}
              >
                <option value="" className="bg-gray-900">Select role</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-gray-900">{r.label}</option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-red-400">{errors.role.message}</p>}
            </div>

            {/* Role info banners */}
            {(currentRole === 'supervisor' || currentRole === 'safety_officer') && (
              <div className="p-3 bg-blue-400/10 border border-blue-400/30 rounded-xl text-blue-300 text-sm flex gap-2 items-start">
                <span>⏳</span>
                <span>Your registration will be sent to management for approval. You can login once approved.</span>
              </div>
            )}

            {currentRole === 'management' && (
              <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl text-yellow-300 text-sm flex gap-2 items-start">
                <span>🔐</span>
                <span>Management registration requires a secret token provided by your administrator.</span>
              </div>
            )}

            {/* Management Secret Token */}
            {currentRole === 'management' && (
              <div className="flex flex-col gap-1">
                <label className={lbl}>Management Token <span className="text-red-400">*</span></label>
                <input type="password" placeholder="Enter management secret token"
                  {...register('managementToken')} className={inp} />
                {errors.managementToken && (
                  <p className="text-xs text-red-400">{errors.managementToken.message}</p>
                )}
              </div>
            )}

            {/* Specialization — only for Safety Officer */}
            {currentRole === 'safety_officer' && (
              <div className="flex flex-col gap-1">
                <label className={lbl}>
                  Specialization Domain <span className="text-red-400">*</span>
                </label>
                <select {...register('specialization')} className={inp}>
                  <option value="" className="bg-gray-900">Select your domain</option>
                  {DOMAINS.map((d) => (
                    <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="text-xs text-red-400">{errors.specialization.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  Helps supervisors assign relevant incidents to you.
                </p>
              </div>
            )}

            {/* Department */}
            <div className="flex flex-col gap-1">
              <label className={lbl}>Department</label>
              <input placeholder="Construction" {...register('department')} className={inp} />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className={lbl}>Phone (10 digits)</label>
              <input placeholder="9876543210" {...register('phone')} className={inp} />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className={lbl}>Password</label>
              <input type="password" placeholder="••••••••" {...register('password')} className={inp} />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className={lbl}>Confirm Password</label>
              <input type="password" placeholder="••••••••" {...register('confirmPassword')} className={inp} />
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-gray-500 text-center">🔖 Employee ID will be auto-generated</p>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 font-semibold hover:text-yellow-300">Sign In</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            <Link to="/" className="hover:text-gray-300">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;