import { RotateCcw, ShieldAlert, Activity } from 'lucide-react';

export default function ControlPanel({ onInject, onRefreshLogs, isLoading }) {
  const injectOptions = [
    { id: 'mongo', label: 'MongoDB Down' },
    { id: 'backend', label: 'Backend Down' },
    { id: 'cpu', label: 'High CPU' },
    { id: 'memory', label: 'High Memory' },
    { id: 'disk', label: 'Disk Full' },
    { id: 'crash', label: 'Crash Loop' },
    { id: 'network', label: 'Network Issue' },
    { id: 'db-slow', label: 'DB Slow' },
    { id: 'auth', label: 'Auth Failure' },
    { id: 'api', label: 'API Failure' },
    { id: 'docker', label: 'Docker Engine' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4 mt-2 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            System Operations
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Simulate failures for automated recovery</p>
        </div>
        <button
          onClick={onRefreshLogs}
          disabled={isLoading}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 p-2 rounded-lg transition-all flex items-center justify-center shadow-sm border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sync Logs"
        >
          <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-zinc-400' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-2">
        <div className="flex flex-col gap-3">
          {injectOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onInject(opt.id)}
              disabled={isLoading}
              className="bg-zinc-950 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 text-red-400 px-4 py-3.5 rounded-lg font-medium transition-all flex items-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group text-sm w-full text-left"
            >
              <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
