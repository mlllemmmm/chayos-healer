import { RotateCcw, ShieldAlert, Activity } from 'lucide-react';
import { useState } from 'react';

export default function ControlPanel({ onInject, onRefreshLogs, isLoading }) {
  const [localLoadingState, setLocalLoadingState] = useState({});

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
    { id: 'port-conflict', label: 'Port Conflict' },
    { id: 'network-isolation', label: 'Network Isolation' },
    { id: 'memory-pressure', label: 'Memory Pressure' },
  ];

  const triggerCPU = async () => {
    setLocalLoadingState(prev => ({ ...prev, cpu: true }));
    try {
      const res = await fetch("http://localhost:8000/inject/cpu", { method: "POST" });
      console.log("CPU Spike Triggered");
      alert("CPU Spike Triggered successfully!");
    } catch (err) {
      console.error("Error triggering CPU spike", err);
      alert("Error triggering CPU spike");
    } finally {
      setTimeout(() => setLocalLoadingState(prev => ({ ...prev, cpu: false })), 1000);
    }
  };

  const triggerMemory = async () => {
    setLocalLoadingState(prev => ({ ...prev, memory: true }));
    try {
      const res = await fetch("http://localhost:8000/inject/memory", { method: "POST" });
      console.log("Memory Stress Triggered");
      alert("Memory Stress Triggered successfully!");
    } catch (err) {
      console.error("Error triggering Memory stress", err);
      alert("Error triggering Memory stress");
    } finally {
      setTimeout(() => setLocalLoadingState(prev => ({ ...prev, memory: false })), 1000);
    }
  };

  const triggerAPIFailure = async () => {
    setLocalLoadingState(prev => ({ ...prev, api: true }));
    try {
      const res = await fetch("http://localhost:8000/inject/api-failure", { method: "POST" });
      console.log("API Failure Triggered");
      alert("API Failure Triggered successfully!");
    } catch (err) {
      console.error("Error triggering API failure", err);
      alert("Error triggering API failure");
    } finally {
      setTimeout(() => setLocalLoadingState(prev => ({ ...prev, api: false })), 1000);
    }
  };

  const triggerPortConflict = async () => {
    setLocalLoadingState(prev => ({ ...prev, 'port-conflict': true }));
    try {
      const res = await fetch("http://localhost:8000/inject/port-conflict", { method: "POST" });
      console.log("Port Conflict Triggered");
      alert("Port Conflict Triggered successfully!");
    } catch (err) {
      console.error("Error triggering Port conflict", err);
      alert("Error triggering Port conflict");
    } finally {
      setTimeout(() => setLocalLoadingState(prev => ({ ...prev, 'port-conflict': false })), 1000);
    }
  };

  const handleOptionClick = (id) => {
    if (id === 'cpu') return triggerCPU();
    if (id === 'memory') return triggerMemory();
    if (id === 'api') return triggerAPIFailure();
    if (id === 'port-conflict') return triggerPortConflict();
    
    // Fallback for other buttons
    onInject(id);
  };

  return (
    <div className="glass-card flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4 mt-2 shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            System Operations
          </h2>
          <p className="text-text-secondary text-sm mt-1">Simulate failures for automated recovery</p>
        </div>
        <button
          onClick={onRefreshLogs}
          disabled={isLoading}
          className="btn-icon"
          title="Sync Logs"
        >
          <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-text-secondary' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-2 mt-4">
        <div className="flex flex-col gap-3">
          {injectOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt.id)}
              disabled={isLoading || localLoadingState[opt.id]}
              className="bg-background border border-error/20 hover:bg-error/10 hover:border-error/40 text-error px-4 py-3.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group text-sm w-full text-left outline-none focus:ring-2 focus:ring-error focus:border-transparent"
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
