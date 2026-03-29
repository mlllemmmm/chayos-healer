import { AlertTriangle, Info, XOctagon, Clock } from 'lucide-react';
import { cn } from '../utils';

export default function IncidentLogs({ logs }) {
  const getIcon = (type) => {
    switch (type) {
      case 'error': return XOctagon;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-400/10 border-red-500/20';
      case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          System Event Logs
        </h2>
        <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-md font-mono border border-zinc-700">
          {logs.length} Events
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No events recorded</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const Icon = getIcon(log.type);
            return (
              <div 
                key={index} 
                className={cn(
                  "flex gap-4 p-3 rounded-lg border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
                  getColor(log.type)
                )}
              >
                <div className="shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-100 text-sm font-medium">{log.message}</p>
                  <p className="text-xs opacity-75 mt-1 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <span className="mx-2 text-zinc-500">|</span>
                    <span className="text-zinc-400">{log.source || 'system'}</span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
