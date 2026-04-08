import { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, User, Lock } from 'lucide-react';
import { cn } from '../utils';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(true);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Interactive Cursor Halo (Fixed position, high opacity and mix blend) */}
      <div 
        className="pointer-events-none fixed w-[600px] h-[600px] rounded-full blur-[80px] bg-secondary/40 z-0 mix-blend-screen"
        style={{
           left: mousePos.x - 300,
           top: mousePos.y - 300
        }}
      />
      
      {/* Secondary fixed drift blob for depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-primary/10 rounded-full blur-[120px] animate-blob-drift pointer-events-none" />

      <div className="w-full max-w-md glass-card relative z-10 !p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out cursor-default">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-surface border border-border shadow-medium rounded-2xl flex items-center justify-center mb-5">
            <ShieldAlert className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(124,92,255,0.6)]" />
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">System Core</h1>
          <p className="text-text-secondary text-sm mt-2 font-medium tracking-wide">Authenticate to access infrastructure controls</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary ml-1 tracking-widest uppercase">Operator ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sre@matrix.local"
                className="input-field w-full !pl-11 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary ml-1 tracking-widest uppercase">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field w-full !pl-11 h-12 tracking-widest"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-8 btn-primary h-14 text-sm tracking-widest uppercase relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              Authenticate
              <KeyRound className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
