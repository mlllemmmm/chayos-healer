import { Flame, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const MOCK_API = 'http://127.0.0.1:8000';

export default function ChaosPanel() {
  const [injectedFailure, setInjectedFailure] = useState(null);
  const [isInjecting, setIsInjecting] = useState(false);

  const handleChaosRun = async () => {
    setIsInjecting(true);
    try {
      const res = await fetch(`${MOCK_API}/chaos/run`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setInjectedFailure(data.injected);
      }
    } catch (e) {
      console.error(e);
    }
    setIsInjecting(false);
  };

  return (
    <div className="glass-card flex flex-col items-center justify-center text-center">
      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 mb-3 tracking-tight">
        <Flame className="w-5 h-5 text-error" />
        Chaos Engine
      </h2>
      <p className="text-text-secondary text-sm mb-8 max-w-xs leading-relaxed">
        Inject random true failures into the system to test autonomous healing capabilities.
      </p>

      <button 
        onClick={handleChaosRun}
        disabled={isInjecting}
        className="bg-gradient-to-r from-error to-warning hover:from-warning hover:to-error text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 shadow-strong hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] border-none cursor-pointer outline-none"
      >
        {isInjecting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5" />}
        INITIATE CHAOS
      </button>

      {injectedFailure && (
        <div className="mt-8 bg-background/50 border border-error/30 px-6 py-5 rounded-2xl w-full backdrop-blur-sm animate-in zoom-in duration-300">
          <p className="text-text-secondary text-[10px] uppercase font-bold mb-1.5 tracking-[0.2em]">Latest Injection</p>
          <p className="text-error font-mono font-bold text-lg tracking-wide">{injectedFailure.toUpperCase()}</p>
        </div>
      )}
    </div>
  );
}
