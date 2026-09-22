import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { FhaLogo } from './FhaLogo';
import { 
  Building, 
  Lock, 
  User as UserIcon, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function LoginView({ onLogin, theme, onToggleTheme }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick sandbox accounts helper
  const sandboxAccounts = [
    { label: 'MD', desc: 'Managing Director & CEO', name: 'Arc. Joseph Enene' },
    { label: 'PM', desc: 'Project Manager', name: 'Ahmed Abdul' },
    { label: 'QS', desc: 'Quantity Surveyor', name: 'Surv. C. Okafor' },
    { label: 'RE', desc: 'Resident Engineer', name: 'Adebisi Olamide' },
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-800 dark:text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none transition-colors duration-200">
      
      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition shadow-sm dark:shadow-md cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
        </button>
      </div>

      {/* Decorative Emerald Ambient Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/[0.04] dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/[0.04] dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left column: Branding, Mission, Authority Crest */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left pr-0 lg:pr-8 flex flex-col items-center lg:items-start">
          <div className="w-28 h-28 mb-4 flex items-center justify-center bg-white dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-xl">
            <FhaLogo size={100} showText={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none mx-auto lg:mx-0">
            <Building className="w-3.5 h-3.5" />
            Federal Republic of Nigeria
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-none font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              FEDERAL HOUSING <br />
              <span className="text-emerald-700 dark:text-emerald-400">AUTHORITY</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
              National Housing Delivery Programme (NHDP) Executive Monitoring & Multi-Role Operations Portal.
            </p>
          </div>

          <div className="border-l-2 border-emerald-500/40 pl-4 space-y-1.5 hidden lg:block text-left">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Platform Purpose</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed">
              Real-time synchronization of physical site works (WBS), contractor rating metric scorecards, progress valuation claims, on-site telemetry photo validation, and multi-tier executive approval loops.
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Powered by{' '}
            <a 
              href="https://yonahtech.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold hover:underline transition-all"
            >
              Yonahtech Limited
            </a>
          </div>
        </div>

        {/* Right column: Login Form & Sandbox accounts */}
        <div className="lg:col-span-7 bg-white dark:bg-black/80 border border-slate-300 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl dark:shadow-2xl relative transition-colors duration-200">
          
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-white/10 mb-6">
            <div>
              <h2 className="text-lg font-serif text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Portal Access
              </h2>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Please provide your authorized credentials.</p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center">
              <FhaLogo size={44} showText={false} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-500/10 border border-rose-300 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Authorized Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. MD"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/90 border border-slate-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 transition-all shadow-inner font-mono font-bold"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Passphrase key</label>
                <span className="text-[9px] text-slate-600 dark:text-slate-400">All Sandbox passwords: <code className="text-emerald-700 dark:text-emerald-400 font-bold">password@123</code></span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 dark:text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/90 border border-slate-300 dark:border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 transition-all shadow-inner font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:bg-emerald-700/50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 font-serif cursor-pointer"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* QUICK SANDBOX ACCOUNTS PANELS */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Quick Select Authorization Role (Tap to Auto-fill)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sandboxAccounts.map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => handleSandboxClick(acc.label)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    username.toUpperCase() === acc.label 
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-[0_0_12px_rgba(29,112,51,0.15)] font-bold' 
                      : 'bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="text-[10px] font-bold truncate">{acc.label}</div>
                  <div className="text-[9px] font-medium text-slate-600 dark:text-slate-400 truncate mt-0.5">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer copyright */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest pointer-events-none z-10">
        © 2026 Federal Housing Authority Nigeria. Sandbox Environment.
      </footer>
    </div>
  );
}
