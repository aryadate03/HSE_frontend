import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';
import { loginSchema } from '../../utils/validators';
import ErrorMessage from '../../components/common/ErrorMessage';
import { HardHat, Clock, ShieldCheck, Mail, RefreshCw } from 'lucide-react';

// ── Pending Approval Screen ───────────────────────────────────────────────────
const PendingScreen = ({ onBack }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
    style={{ backgroundImage: `repeating-linear-gradient(45deg,rgba(234,179,8,.04) 0,rgba(234,179,8,.04) 1px,transparent 0,transparent 50%)`, backgroundSize: '20px 20px' }}>
    <div className="w-full max-w-md">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-yellow-400 p-3 rounded-2xl mb-4">
          <HardHat size={32} className="text-gray-900" />
        </div>
        <h1 className="text-2xl font-black text-white">BUILDTECH HSE</h1>
        <p className="text-gray-400 text-sm mt-1">Health, Safety & Environment System</p>
      </div>

      {/* Pending card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

        {/* Animated clock icon */}
        <div className="w-20 h-20 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={36} className="text-yellow-400" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Account Under Review</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Your registration has been submitted successfully. Management is reviewing your account and will approve it shortly.
        </p>

        {/* Status steps */}
        <div className="flex flex-col gap-3 mb-7 text-left">
          <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-400">Registration Complete</p>
              <p className="text-xs text-gray-500">Your account has been created</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shrink-0">
              <Clock size={14} className="text-gray-900" />
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-400">Awaiting Management Approval</p>
              <p className="text-xs text-gray-500">Usually takes 1–2 business days</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl opacity-50">
            <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <Mail size={14} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400">Email Notification</p>
              <p className="text-xs text-gray-500">You'll be notified once approved</p>
            </div>
          </div>
        </div>

        {/* Try again button */}
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <RefreshCw size={15} />
          Try Signing In Again
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Contact your administrator if this takes longer than expected.
        </p>
      </div>
    </div>
  </div>
);

// ── Login Page ────────────────────────────────────────────────────────────────
const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError]       = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm(loginSchema);

  const onSubmit = async (data) => {
    setError('');
    setIsPending(false);
    setIsRejected(false);

    const result = await login(data);

    if (result.success) {
      navigate(result.redirectTo || '/worker/dashboard');
    } else {
      const msg = result.message || '';

      // Detect pending approval
      if (msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('approval')) {
        setIsPending(true);
        return;
      }

      // Detect rejected
      if (msg.toLowerCase().includes('rejected')) {
        setIsRejected(true);
        setRejectReason(msg);
        return;
      }

      setError(msg);
    }
  };

  // Show pending screen
  if (isPending) return <PendingScreen onBack={() => setIsPending(false)} />;

  const inp = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 outline-none focus:border-yellow-400 transition-colors";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
      style={{ backgroundImage: `repeating-linear-gradient(45deg,rgba(234,179,8,.04) 0,rgba(234,179,8,.04) 1px,transparent 0,transparent 50%)`, backgroundSize: '20px 20px' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-yellow-400 p-3 rounded-2xl mb-4">
            <HardHat size={32} className="text-gray-900" />
          </div>
          <h1 className="text-2xl font-black text-white">BUILDTECH HSE</h1>
          <p className="text-gray-400 text-sm mt-1">Health, Safety & Environment System</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <ErrorMessage message={error} />

            {/* Rejected banner */}
            {isRejected && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm font-semibold text-red-400 mb-0.5">Account Rejected</p>
                <p className="text-xs text-gray-400">{rejectReason || 'Your account has been rejected. Contact your administrator.'}</p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input type="email" placeholder="you@gmail.com" {...register('email')} className={inp} />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <input type="password" placeholder="••••••••" {...register('password')} className={inp} />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-yellow-400 hover:text-yellow-300">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-400 font-semibold hover:text-yellow-300">Register</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            <Link to="/" className="hover:text-gray-300">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;