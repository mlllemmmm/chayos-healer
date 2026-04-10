import { useState } from 'react';
import { Brain, Send, GraduationCap, Repeat2 } from 'lucide-react';

const ACTION_OPTIONS = [
  { value: 'restart_mongodb', label: 'Restart MongoDB' },
  { value: 'restart_app', label: 'Restart App' },
  { value: 'kill_port_3000', label: 'Kill Port 3000' },
  { value: 'run_diagnostics', label: 'Run Diagnostics' },
];

export default function AdaptiveHealerPanel({
  currentIncident,
  onAdaptiveHeal,
  onTeachFix,
  onRepeatIncident,
  adaptiveResult,
  isLoading,
}) {
  const [selectedAction, setSelectedAction] = useState('restart_app');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          Adaptive Learning
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Show how unknown incidents are analyzed, taught, and learned.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
        <p className="text-sm text-zinc-400">Current Incident</p>
        {currentIncident ? (
          <>
            <p className="text-sm text-zinc-100">
              <span className="text-zinc-400">service:</span> {currentIncident.service}
            </p>
            <p className="text-sm text-zinc-100">
              <span className="text-zinc-400">symptom:</span> {currentIncident.symptom}
            </p>
            <p className="text-sm text-zinc-100 break-words">
              <span className="text-zinc-400">error:</span> {currentIncident.error_log}
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-500">No unknown incident injected yet.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onAdaptiveHeal(currentIncident)}
          disabled={isLoading || !currentIncident}
          className="bg-zinc-950 border border-indigo-500/30 hover:bg-indigo-500/10 hover:border-indigo-500/50 text-indigo-400 px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Analyze Incident
        </button>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-3 text-zinc-100 outline-none"
        >
          {ACTION_OPTIONS.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => onTeachFix(currentIncident, selectedAction)}
          disabled={isLoading || !currentIncident}
          className="bg-zinc-950 border border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <GraduationCap className="w-4 h-4" />
          Teach Fix
        </button>

        <button
          onClick={() => onRepeatIncident(currentIncident)}
          disabled={isLoading || !currentIncident}
          className="bg-zinc-950 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-400 px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Repeat2 className="w-4 h-4" />
          Repeat Same Incident
        </button>
      </div>

      {adaptiveResult && (
        <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/60 space-y-3">
          <p className="text-zinc-100 font-medium">Adaptive Result: {adaptiveResult.status}</p>

          {adaptiveResult.action_id && (
            <p className="text-sm text-zinc-300">
              Recommended action: <span className="font-mono text-indigo-400">{adaptiveResult.action_id}</span>
            </p>
          )}

          {adaptiveResult.mode && (
            <p className="text-sm text-zinc-400">Mode: {adaptiveResult.mode}</p>
          )}

          {adaptiveResult.scores && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Confidence Basis</p>
              {Object.entries(adaptiveResult.scores).map(([action, meta]) => (
                <div
                  key={action}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2"
                >
                  <div className="font-mono text-sm text-zinc-200">{action}</div>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span>score: {meta.score}</span>
                    <span>count: {meta.count}</span>
                    <span>confidence: {meta.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adaptiveResult.message && (
            <p className="text-sm text-zinc-400">Message: {adaptiveResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
}