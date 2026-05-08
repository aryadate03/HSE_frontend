import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HardHat, AlertTriangle, BarChart3, Users, CheckCircle, ArrowRight, Building2, Award, Clock } from 'lucide-react';

const STATS = [
  { value: '15+', label: 'Years of Excellence' },
  { value: '500+', label: 'Projects Completed' },
  { value: '2000+', label: 'Skilled Workers' },
  { value: '99.8%', label: 'Safety Compliance' },
];

const FEATURES = [
  {
    icon: AlertTriangle,
    title: 'Instant Incident Reporting',
    desc: 'Workers report incidents in real-time from any device. No paperwork, no delays.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Users,
    title: 'Multi-Level Oversight',
    desc: 'Supervisors, Safety Officers, and Management stay informed at every step.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Data-driven insights to identify risk patterns and prevent future incidents.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: CheckCircle,
    title: 'Full Audit Trail',
    desc: 'Every action tracked and logged — from report submission to resolution.',
    color: 'bg-purple-100 text-purple-600',
  },
];

const SERVICES = [
  { icon: Building2, title: 'Commercial Construction', desc: 'High-rise buildings, malls, office complexes' },
  { icon: HardHat,   title: 'Industrial Projects',    desc: 'Factories, warehouses, manufacturing plants' },
  { icon: Award,     title: 'Infrastructure Works',   desc: 'Roads, bridges, tunnels, and public utilities' },
  { icon: Clock,     title: '24/7 Site Operations',   desc: 'Round-the-clock project management and safety' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ─── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-yellow-400 p-1.5 rounded-lg">
              <HardHat size={22} className="text-gray-900" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm leading-none">BUILDTECH</p>
              <p className="text-xs text-gray-400 leading-none">Construction Co.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#about"    className="hover:text-gray-900 transition-colors">About</a>
            <a href="#services" className="hover:text-gray-900 transition-colors">Services</a>
            <a href="#hse"      className="hover:text-gray-900 transition-colors">HSE System</a>
            <a href="#contact"  className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-semibold text-white bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors text-gray-900"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-16 min-h-screen flex items-center relative overflow-hidden bg-gray-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)`,
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/70" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck size={14} className="text-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold">ISO 45001 Certified Safety Standards</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Building the
              <span className="text-yellow-400"> Future</span>,
              <br />Safely.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              BUILDTECH Construction is a premier construction company committed to delivering world-class infrastructure with an uncompromising focus on worker safety and operational excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-all transform hover:scale-105"
              >
                Get Started <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 text-white hover:bg-white/10 font-semibold rounded-xl transition-colors"
              >
                Sign In to HSE System
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                <p className="text-4xl font-black text-yellow-400 mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-yellow-500 font-bold text-sm uppercase tracking-widest mb-3">Who We Are</p>
              <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                A Legacy of Safe,<br />Quality Construction
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Founded over 15 years ago, BUILDTECH Construction has grown into one of the most trusted names in the construction industry. We specialize in large-scale commercial, industrial, and infrastructure projects across the country.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                Our digital HSE (Health, Safety & Environment) system ensures every incident is reported, tracked, and resolved — protecting our most valuable asset: our people.
              </p>
              <div className="flex flex-col gap-3">
                {['Zero tolerance for safety violations', 'Real-time incident tracking and resolution', 'Trained safety officers on every site', 'Regular safety audits and compliance checks'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-yellow-500 shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {SERVICES.map((s, i) => (
                <div key={i} className="p-5 rounded-2xl border border-gray-100 hover:border-yellow-200 hover:shadow-lg transition-all group">
                  <div className="w-10 h-10 bg-yellow-50 group-hover:bg-yellow-100 rounded-xl flex items-center justify-center mb-3 transition-colors">
                    <s.icon size={20} className="text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services ──────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <p className="text-yellow-500 font-bold text-sm uppercase tracking-widest mb-3">What We Do</p>
          <h2 className="text-4xl font-black text-gray-900">Our Core Services</h2>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            { title: 'Site Safety Management',    desc: 'Comprehensive safety protocols for every construction site, from foundation to finishing.', emoji: '🏗️' },
            { title: 'Worker Health Programs',    desc: 'Regular health checkups, PPE provision, and wellness programs for all site workers.',      emoji: '🦺' },
            { title: 'Environmental Compliance',  desc: 'Strict adherence to environmental standards, waste management, and green construction.',   emoji: '🌿' },
            { title: 'Risk Assessment',           desc: 'Proactive identification and mitigation of potential hazards before work begins.',          emoji: '⚠️' },
            { title: 'Emergency Response',        desc: '24/7 emergency response team trained to handle any site incident immediately.',             emoji: '🚨' },
            { title: 'Digital Incident Tracking', desc: 'Our HSE system ensures every incident is logged, reviewed, and resolved transparently.',   emoji: '📱' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
              <div className="text-3xl mb-4">{s.emoji}</div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HSE System ────────────────────────────────────────────────────── */}
      <section id="hse" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-yellow-400 font-bold text-sm uppercase tracking-widest mb-3">Our Digital Platform</p>
            <h2 className="text-4xl font-black text-white mb-4">HSE Incident Reporting System</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A fully digital platform replacing paper-based HSE reporting — faster, smarter, and more accountable.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-yellow-400 rounded-3xl p-10 text-center">
            <h3 className="text-3xl font-black text-gray-900 mb-3">Ready to Get Started?</h3>
            <p className="text-gray-700 mb-8 max-w-lg mx-auto">
              Join BUILDTECH's digital safety platform. Register your account or sign in to access the HSE system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Register Now
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Contact ───────────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-yellow-500 font-bold text-sm uppercase tracking-widest mb-3">Get In Touch</p>
          <h2 className="text-4xl font-black text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-500 mb-12 max-w-lg mx-auto">
            Have questions about our projects or HSE system? Reach out to our team.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { emoji: '📍', title: 'Address',  value: '123 Construction Ave, Mumbai, Maharashtra 400001' },
              { emoji: '📞', title: 'Phone',    value: '+91 98765 43210' },
              { emoji: '✉️', title: 'Email',    value: 'info@buildtech.co.in' },
            ].map((c, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-yellow-200 transition-colors">
                <div className="text-3xl mb-3">{c.emoji}</div>
                <p className="font-bold text-gray-900 mb-1">{c.title}</p>
                <p className="text-gray-500 text-sm">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-lg">
              <HardHat size={16} className="text-gray-900" />
            </div>
            <span className="text-white font-bold text-sm">BUILDTECH Construction</span>
          </div>
          <p className="text-xs">© 2026 BUILDTECH Construction Co. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <button onClick={() => navigate('/login')}    className="hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Register</button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;