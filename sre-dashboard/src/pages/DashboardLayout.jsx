import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatusPanel from '../components/StatusPanel';
import IncidentLogs from '../components/IncidentLogs';
import ControlPanel from '../components/ControlPanel';
import MetricsSection from '../components/MetricsSection';

const MOCK_API = 'http://127.0.0.1:8000';

export default function DashboardLayout({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState({ mongo: 'healthy', backend: 'healthy' });
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({ cpu: 32.4, memory: 4.2, uptime: 99.99 });

  // Use a ref or simple boolean to switch between mock arrays or real fetch
  // For now we will structure standard fetch calls but fallback to mock updates
  // if fetch fails (e.g. backend isn't running)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${MOCK_API}/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.warn('Backend unavailable, using local state for Status');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${MOCK_API}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.warn('Backend unavailable, using local state for logs');
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();
    fetchLogs();

    // Pseudo-realtime updates for metrics
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(2, Math.min(16, prev.memory + (Math.random() * 0.4 - 0.2))),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInjectFailure = async () => {
    setIsLoading(true);
    const newLog = {
      message: "MongoDB DOWN detected", type: "error", source: "monitor-agent", timestamp: new Date().toISOString()
    };
    
    try {
      const res = await fetch(`${MOCK_API}/inject-failure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service: 'mongodb' })
      });
      if (res.ok) {
        fetchStatus();
      } else { throw new Error('Failed'); }
    } catch (e) {
      // Mock update
      setStatus(prev => ({ ...prev, mongo: 'down' }));
      setLogs(prev => [newLog, ...prev]);
    }
    setIsLoading(false);
  };

  const handleTriggerHeal = async () => {
    setIsLoading(true);
    const logsAppended = [
      { message: "Restarting container...", type: "warning", source: "auto-healer", timestamp: new Date().toISOString() },
      { message: "MongoDB restarted successfully", type: "info", source: "auto-healer", timestamp: new Date(Date.now() + 1000).toISOString() }
    ];

    try {
       const res = await fetch(`${MOCK_API}/auto-heal`, { method: 'POST' });
       if (res.ok) {
         fetchStatus();
       } else { throw new Error('Failed'); }
    } catch (e) {
       setStatus(prev => ({ ...prev, mongo: 'healthy' }));
       setLogs(prev => [...logsAppended.reverse(), ...prev]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden text-zinc-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      
      <main className="flex-1 overflow-y-auto w-full relative">
        {/* Subtle background gradient top-left */}
        <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto p-8 relative z-10 w-full space-y-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
            <p className="text-zinc-400 mt-2 text-sm max-w-xl">
              Monitor vital system parameters, manage incident logs, and control failure injection routines in real-time.
            </p>
          </header>

          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StatusPanel status={status} />
              <MetricsSection metrics={metrics} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <IncidentLogs logs={logs} />
                </div>
                <div className="lg:col-span-1">
                  <ControlPanel 
                    onInjectFailure={handleInjectFailure} 
                    onTriggerHeal={handleTriggerHeal}
                    onRefreshLogs={fetchLogs}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <IncidentLogs logs={logs} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 shadow-sm animate-in fade-in py-20 text-center">
              <h3 className="text-lg font-medium text-zinc-100 mb-2">Platform Settings</h3>
              <p className="text-zinc-500">Agent configurations and alerting rules are managed via CI/CD for this environment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
