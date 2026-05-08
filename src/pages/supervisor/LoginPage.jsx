import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const { login } = useAuth();
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      const code = err.response?.data?.code;
      if (code === 'PENDING_APPROVAL') {
        setPendingApproval(true);
      } else {
        toastError(msg);
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0d1117' }}>

      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #4f63ff, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full opacity-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #4f63ff, transparent)' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f63ff, #7c3aed)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-[#e8eaf0]">IncidentIQ</div>
              <div className="text-[10px] text-[#8892a4] uppercase tracking-widest">Supervisor Portal</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8">
          {pendingApproval ? (
            /* Pending approval state */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)' }}>
                <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#e8eaf0] mb-2">Awaiting Approval</h2>
              <p className="text-sm text-[#8892a4] leading-relaxed mb-6">
                Your supervisor account is pending admin approval. You will be notified via email once your account has been activated.
              </p>
              <div className="rounded-lg p-4 text-left mb-6"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs text-yellow-400 font-medium mb-1">What happens next?</p>
                <ul className="text-xs text-[#8892a4] space-y-1">
                  <li>• Admin will review your registration</li>
                  <li>• You'll receive an email notification</li>
                  <li>• Then you can log in normally</li>
                </ul>
              </div>
              <button
                onClick={() => setPendingApproval(false)}
                className="btn-secondary w-full justify-center"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#e8eaf0]">Sign In</h2>
                <p className="text-sm text-[#8892a4] mt-1">Access your supervisor dashboard</p>
              </div>

              {errors.general && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={`input-field ${errors.email ? 'border-red-500/50' : ''}`}
                    autoComplete="email"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-field ${errors.password ? 'border-red-500/50' : ''}`}
                    autoComplete="current-password"
                  />
                  {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5 text-base"
                  style={{ background: 'linear-gradient(135deg, #4f63ff, #7c3aed)' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-center text-xs text-[#8892a4]">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors font-medium">
                    Register here
                  </Link>
                </p>
              </div>

              {/* Demo credentials */}
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(79,99,255,0.06)', border: '1px solid rgba(79,99,255,0.15)' }}>
                <p className="text-[10px] text-[#8892a4] uppercase tracking-wider mb-2 font-medium">Demo Credentials</p>
                <p className="text-xs text-[#818cf8] font-mono">supervisor@company.com</p>
                <p className="text-xs text-[#8892a4] font-mono">password123</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;