import { useState } from 'react';
import { ShieldAlert, KeyRound, User, Lock } from 'lucide-react';
import { cn } from '../utils';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-8 relative z-10 transition-all">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 border border-zinc-700 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">SRE Command Center</h1>
          <p className="text-zinc-400 text-sm mt-2">Sign in to access system controls</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 ml-1">Work Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sre@company.com"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 ml-1">Access Token</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-6 bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 group shadow-lg shadow-indigo-500/20"
          >
            Authenticate
            <KeyRound className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
