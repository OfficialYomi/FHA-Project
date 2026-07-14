import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  UserCheck, 
  Trash2, 
  Key,
  BadgeAlert,
  AlertCircle
} from 'lucide-react';

interface UsersViewProps {
  users: User[];
  currentUser: User | null;
  onCreateUser: (userData: any) => Promise<void>;
  onDeleteUser?: (username: string) => Promise<void>;
}

export default function UsersView({ users, currentUser, onCreateUser, onDeleteUser }: UsersViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('PM');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMD = currentUser?.role === 'MD';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !username || !email) {
      setError('Please fill out all fields.');
      return;
    }

    // PM is forbidden from creating MDs
    if (role === 'MD' && !isMD) {
      setError('Only the Managing Director (MD) can assign the MD role.');
      return;
    }

    // Check duplicate
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      setError(`Username "${username}" already exists.`);
      return;
    }

    try {
      await onCreateUser({
        name,
        username: username.toUpperCase(),
        email,
        role,
        password: 'password@123' // default password requested by user
      });
      
      setSuccess(`User ${username.toUpperCase()} created successfully with default password 'password@123'`);
      setName('');
      setUsername('');
      setEmail('');
      setRole('PM');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'MD':
        return 'bg-amber-500/10 border border-amber-500/30 text-amber-400';
      case 'PM':
        return 'bg-blue-500/10 border border-blue-500/30 text-blue-400';
      case 'QS':
        return 'bg-purple-500/10 border border-purple-500/30 text-purple-400';
      case 'RE':
        return 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
      case 'FD':
        return 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400';
      case 'CT':
        return 'bg-pink-500/10 border border-pink-500/30 text-pink-400';
      default:
        return 'bg-slate-500/10 border border-slate-500/30 text-slate-400';
    }
  };

  const getRoleTitle = (r: UserRole) => {
    switch (r) {
      case 'MD': return 'Managing Director & CEO';
      case 'PM': return 'Project Manager / Delivery';
      case 'QS': return 'Quantity Surveyor / Auditor';
      case 'RE': return 'Resident Engineer / Site Inspector';
      case 'FD': return 'Finance Director';
      case 'CT': return 'Central Treasury / Disbursements';
      case 'CONTRACTOR': return 'Contractor / Building Partner';
      default: return 'System User';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-amber-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Access & Identity Management</div>
          <h2 className="text-2xl font-serif text-white tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            System Users Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system authorization, register personnel accounts, and assign oversight roles for the National Housing Program.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition self-start md:self-auto shadow-lg shadow-amber-500/10"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? 'Hide Registration Panel' : 'Register New Staff User'}
        </button>
      </div>

      {/* Form Area */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-black/40 border border-amber-500/20 rounded-2xl p-6 max-w-xl space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.03)] animate-fade-in">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <UserPlus className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register Program Personnel</h3>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Arc. Joseph Enene"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username (Caps, distinct)</label>
              <input
                type="text"
                placeholder="e.g. QS_ENENE"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@fha.gov.ng"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Role & Authority</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              >
                {isMD && <option value="MD">Managing Director & CEO (MD)</option>}
                <option value="PM">Project Manager (PM)</option>
                <option value="QS">Quantity Surveyor (QS)</option>
                <option value="RE">Resident Engineer (RE)</option>
                <option value="FD">Finance Director (FD)</option>
                <option value="CT">Central Treasury (CT)</option>
                <option value="CONTRACTOR">Contractor representative (CONTRACTOR)</option>
              </select>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[11px] text-slate-400 flex items-start gap-2">
            <Key className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Default Access Configuration:</span> New accounts are automatically assigned the default password <code className="bg-black/50 px-1 py-0.5 rounded text-amber-400 font-mono font-bold">password@123</code>. The PM can register all roles except the MD role.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition shadow-lg shadow-amber-500/10"
            >
              Authorize & Create Account
            </button>
          </div>
        </form>
      )}

      {/* Success Banner */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-500" />
            Active Authorized Personnel ({users.length})
          </h3>
          <span className="text-[10px] text-slate-500">Only authorized administrators can revoke access.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-widest bg-black/10">
                <th className="py-3 px-5">Personnel Name</th>
                <th className="py-3 px-5">Username</th>
                <th className="py-3 px-5">Access Level (Role)</th>
                <th className="py-3 px-5">Email Address</th>
                <th className="py-3 px-5 text-right">Credentials</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.username} className="border-b border-white/5 text-xs hover:bg-white/5 transition">
                  <td className="py-3.5 px-5 font-semibold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-400 uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-300">
                    {u.username}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getRoleBadgeColor(u.role)}`}>
                      {u.role}
                    </span>
                    <span className="text-slate-500 block text-[9px] mt-0.5">{getRoleTitle(u.role)}</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono text-[10px] text-slate-500">
                    Password: <span className="bg-black/30 px-1.5 py-0.5 rounded text-amber-500/80">password@123</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
