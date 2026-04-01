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

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${MOCK_API}/detect`);
      if (res.ok) {
        const data = await res.json();
        setStatus({
          mongo: data.mongodb === 'running' ? 'healthy' : 'down',
          backend: 'healthy'
        });
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

  // ✅ NEW: Fetch real metrics (no other logic touched)
  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${MOCK_API}/metrics`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.warn('Metrics API unavailable');
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();
    fetchLogs();
    fetchMetrics(); // ✅ added

    // Polling interval every 2.5 seconds
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
      fetchMetrics(); // ✅ added

      // ❌ removed fake random metrics update
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleInject = async (endpoint) => {
    setIsLoading(true);
    const newLog = {
      message: `Simulating ${endpoint} failure...`, type: "warning", source: "monitor-agent", timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(`${MOCK_API}/inject-${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (res.ok) {
        setTimeout(() => {
          fetchStatus();
          fetchLogs();
        }, 1500);
      } else { throw new Error('Failed'); }
    } catch (e) {
      setLogs(prev => [newLog, ...prev]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden text-zinc-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto w-full relative">
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
                    onInject={handleInject}
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