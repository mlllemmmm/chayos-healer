import { Server, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const MOCK_API = 'http://127.0.0.1:8000';

export default function ScalerWidget() {
  const [scaleData, setScaleData] = useState({ instances: 1, reason: 'Normal operation' });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${MOCK_API}/scaling/status`);
        if (res.ok) {
          const data = await res.json();
          setScaleData(data);
        }
      } catch (e) {}
    };
    fetchStatus();
    const int = setInterval(fetchStatus, 3000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="glass-card flex flex-col justify-center h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-text-secondary text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
          <Server className="w-4 h-4 text-secondary" />
          Auto-Scaling
        </h4>
        <span className="text-[10px] font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20 tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          {scaleData.instances > 1 ? 'SCALING ACTIVE' : 'STEADY'}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="text-center bg-surface/50 border border-border p-4 rounded-2xl w-[40%] flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="block text-4xl font-bold text-text-primary z-10">{scaleData.instances === 1 ? 1 : 1}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mt-1 z-10">Base</span>
        </div>
        
        <ArrowRight className="w-6 h-6 text-text-secondary opacity-50 relative shrink-0 -mt-2 animate-pulse" />
        
        <div className="text-center bg-surface/50 border border-border p-4 rounded-2xl w-[40%] flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="block text-4xl font-bold text-secondary z-10 drop-shadow-[0_0_10px_rgba(0,224,255,0.4)]">{scaleData.instances}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mt-1 z-10">Live</span>
        </div>
      </div>
      
      {scaleData.instances > 1 && (
        <p className="text-xs text-secondary mt-auto font-mono bg-secondary/10 px-4 py-3 rounded-xl border border-secondary/20 font-medium">
          Scaling from 1 → {scaleData.instances} inst. ({scaleData.reason})
        </p>
      )}
    </div>
  );
}
