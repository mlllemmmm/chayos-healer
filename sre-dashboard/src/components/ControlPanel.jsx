import { RotateCcw, ShieldAlert, Brain } from 'lucide-react';

export default function ControlPanel({ onInject, onRefreshLogs, isLoading }) {
  const injectOptions = [
    { id: 'mongo', label: 'MongoDB Down', icon: ShieldAlert },
    { id: 'backend', label: 'Backend Down', icon: ShieldAlert },
    { id: 'cpu', label: 'High CPU', icon: ShieldAlert },
    { id: 'memory', label: 'High Memory', icon: ShieldAlert },
    { id: 'disk', label: 'Disk Full', icon: ShieldAlert },
    { id: 'crash', label: 'Crash Loop', icon: ShieldAlert },
    { id: 'network', label: 'Network Issue', icon: ShieldAlert },
    { id: 'db-slow', label: 'DB Slow', icon: ShieldAlert },
    { id: 'auth', label: 'Auth Failure', icon: ShieldAlert },
    { id: 'api', label: 'API Failure', icon: ShieldAlert },
    { id: 'docker', label: 'Docker Engine', icon: ShieldAlert },
    { id: 'port-conflict', label: 'Port Conflict', icon: ShieldAlert },
    { id: 'network-isolation', label: 'Network Isolation', icon: ShieldAlert },
    { id: 'memory-pressure', label: 'Memory Pressure', icon: ShieldAlert },
    { id: 'unknown', label: 'Unknown Error', icon: Brain },
  ];

  return (
    <div className="glass-card flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4 mt-2 shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            System Operations
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Simulate failures for automated recovery
          </p>
        </div>

        <button
          onClick={onRefreshLogs}
          disabled={isLoading}
          className="btn-icon"
          title="Sync Logs"
        >
          <RotateCcw
            className={`w-4 h-4 ${isLoading ? 'animate-spin text-text-secondary' : ''}`}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-2 mt-4">
        <div className="flex flex-col gap-3">
          {injectOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => onInject(opt.id)}
                disabled={isLoading}
                className="bg-background border border-error/20 hover:bg-error/10 hover:border-error/40 text-error px-4 py-3.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group text-sm w-full text-left outline-none focus:ring-2 focus:ring-error focus:border-transparent"
              >
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}