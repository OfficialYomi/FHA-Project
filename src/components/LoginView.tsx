import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Building, 
  Lock, 
  User as UserIcon, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick sandbox accounts helper
  const sandboxAccounts = [
    { label: 'MD', desc: 'Managing Director & CEO', name: 'Arc. Joseph Enene' },
    { label: 'PM', desc: 'Project Manager', name: 'Engr. Musa Bello' },
    { label: 'QS', desc: 'Quantity Surveyor', name: 'Surv. C. Okafor' },
    { label: 'RE', desc: 'Resident Engineer', name: 'Engr. Fatima Yusuf' },
    { label: 'FD', desc: 'Finance Director', name: 'Mr. Aliyu Ibrahim' },
    { label: 'CT', desc: 'Central Treasury', name: 'Mrs. Ngozi Ezenwa' },
    { label: 'CONTRACTOR', desc: 'Contractor Rep', name: 'ABC Construction' }
  ];

  const handleSandboxClick = (label: string) => {
    setUsername(label);
    setPassword('password@123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both your authorized username and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await onLogin(username, password);
      if (!res.success) {
        setError(res.error || 'Access denied. Incorrect credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Decorative Golden Ambient Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left column: Branding, Mission, Authority Crest */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left pr-0 lg:pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none mx-auto lg:mx-0">
            <Building className="w-3.5 h-3.5" />
            Federal Republic of Nigeria
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-none font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              FEDERAL HOUSING <br />
              <span className="text-amber-500">AUTHORITY</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
              National Housing Delivery Programme (NHDP) Executive Monitoring & Multi-Role Operations Portal.
            </p>
          </div>

          <div className="border-l-2 border-amber-500/30 pl-4 space-y-1.5 hidden lg:block">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Platform Purpose</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Real-time synchronization of physical site works (WBS), contractor rating metric scorecards, progress valuation claims, on-site telemetry photo validation, and multi-tier executive approval loops.
            </p>
          </div>
        </div>

        {/* Right column: Login Form & Sandbox accounts */}
        <div className="lg:col-span-7 bg-black/60 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative">
          
          <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-6">
            <div>
              <h2 className="text-lg font-serif text-white tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Secure Portal Access
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Please provide your assigned credential keys.</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. MD"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-black/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-all shadow-inner font-mono font-bold"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passphrase key</label>
                <span className="text-[9px] text-slate-500">All Sandbox passwords: <code className="text-amber-500/80 font-bold">password@123</code></span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/80 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-all shadow-inner font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 font-serif"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Establish Secure Connection'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* QUICK SANDBOX ACCOUNTS PANELS */}
          <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quick Select Authorization Role (Tap to Auto-fill)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sandboxAccounts.map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => handleSandboxClick(acc.label)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    username.toUpperCase() === acc.label 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-[10px] font-bold truncate">{acc.label}</div>
                  <div className="text-[9px] font-medium text-slate-500 truncate mt-0.5">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer copyright */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest pointer-events-none z-10">
        © 2026 Federal Housing Authority Nigeria. Sandbox Environment.
      </footer>
    </div>
  );
}
