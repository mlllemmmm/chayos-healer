import { RotateCcw, ShieldAlert, Activity } from 'lucide-react';

export default function ControlPanel({ onInjectFailure, onTriggerHeal, onRefreshLogs, isLoading }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            System Operations
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Manual overrides and recovery controls</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={onInjectFailure}
          disabled={isLoading}
          className="flex-1 bg-zinc-950 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-400 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Inject Mongo Down
        </button>

        <button
          onClick={onTriggerHeal}
          disabled={isLoading}
          className="flex-1 bg-zinc-950 border border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Activity className="w-4 h-4 group-hover:animate-pulse" />
          Trigger Auto-Heal
        </button>

        <button
          onClick={onRefreshLogs}
          disabled={isLoading}
          className="flex-none bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-sm border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-zinc-400' : ''}`} />
          Force Sync
        </button>
      </div>
    </div>
  );
}
