import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'supervisor', department: '', phone: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authAPI.register({
        name: form.name, email: form.email, password: form.password,
        role: form.role, department: form.department, phone: form.phone,
      });
      setRegistered(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0d1117' }}>
        <div className="glass-card p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: registered.requiresApproval ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
              border: `2px solid ${registered.requiresApproval ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
            {registered.requiresApproval ? (
              <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h2 className="text-lg font-semibold text-[#e8eaf0] mb-2">
            {registered.requiresApproval ? 'Registration Submitted' : 'Registration Successful!'}
          </h2>
          <p className="text-sm text-[#8892a4] mb-6">{registered.message}</p>
          <button onClick={() => navigate('/login')} className="btn-primary justify-center w-full">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0d1117' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #4f63ff, transparent)' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#e8eaf0]">Create Account</h2>
            <p className="text-sm text-[#8892a4] mt-1">Register as a supervisor (requires admin approval)</p>
          </div>

          {errors.general && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="Sarah Mitchell" className={`input-field ${errors.name ? 'border-red-500/50' : ''}`} />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@company.com" className={`input-field ${errors.email ? 'border-red-500/50' : ''}`} />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="Min. 6 chars" className={`input-field ${errors.password ? 'border-red-500/50' : ''}`} />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat password" className={`input-field ${errors.confirmPassword ? 'border-red-500/50' : ''}`} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>
              <div>
                <label className="label">Department</label>
                <input name="department" value={form.department} onChange={handleChange}
                  placeholder="Operations" className="input-field" />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+1-555-0100" className="input-field" />
              </div>
            </div>

            <div className="p-3 rounded-lg text-xs text-[#8892a4]"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              ⏳ Supervisor accounts require admin approval before login access is granted.
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
              style={{ background: 'linear-gradient(135deg, #4f63ff, #7c3aed)' }}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-[#8892a4] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#818cf8] hover:text-[#a5b4fc] transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;