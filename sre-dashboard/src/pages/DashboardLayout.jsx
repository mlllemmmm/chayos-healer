import { useState, useEffect } from 'react';
import StatusPanel from '../components/StatusPanel';
import ControlPanel from '../components/ControlPanel';
import IncidentLogs from '../components/IncidentLogs';
import MetricsChart from '../components/MetricsChart';
import ScalerWidget from '../components/ScalerWidget';
import AlertToasts from '../components/AlertToasts';
import Sidebar from '../components/Sidebar';
import PlaybookManager from '../components/PlaybookManager';
import MetricsSection from '../components/MetricsSection';
import AdaptiveHealerPanel from '../components/AdaptiveHealerPanel';

const MOCK_API = 'http://127.0.0.1:8000';

export default function DashboardLayout({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState({ mongo: 'healthy', backend: 'healthy' });
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [adaptiveResult, setAdaptiveResult] = useState(null);
  const [metrics, setMetrics] = useState({ cpu: 32.4, memory: 4.2, uptime: 99.99 });

  useEffect(() => {
    fetchStatus();
    fetchLogs();

    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();

      setMetrics((prev) => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(2, Math.min(16, prev.memory + (Math.random() * 0.4 - 0.2))),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${MOCK_API}/status`);
      if (res.ok) setStatus(await res.json());
    } catch {
      console.warn('Failed to fetch status');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${MOCK_API}/logs`);
      if (res.ok) setLogs(await res.json());
    } catch {
      console.warn('Failed to fetch logs');
    }
  };

  const handleInject = async (type) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${MOCK_API}/inject-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();

        if (type === 'unknown' && data.incident) {
          setCurrentIncident(data.incident);
          setAdaptiveResult(null);
        }

        await fetchLogs();
        await fetchStatus();
      }
    } catch {
      console.warn(`Failed to inject ${type}`);
    }
    setIsLoading(false);
  };

  const handleAdaptiveHeal = async (incident) => {
    if (!incident) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${MOCK_API}/adaptive-heal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident),
      });

      if (res.ok) {
        const data = await res.json();
        setAdaptiveResult(data);
        await fetchLogs();
      }
    } catch {
      console.warn('Adaptive heal failed');
    }
    setIsLoading(false);
  };

  const handleTeachFix = async (incident, actionId) => {
    if (!incident) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${MOCK_API}/teach-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident, action_id: actionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setAdaptiveResult(data);
        await fetchLogs();
      }
    } catch {
      console.warn('Teach fix failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-background text-text-primary">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <h1 className="text-4xl font-bold">System Operations</h1>

        {activeTab === 'dashboard' && (
          <>
            <StatusPanel status={status} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <MetricsChart />
              <ScalerWidget />
            </div>

            <MetricsSection metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <IncidentLogs logs={logs} />
              </div>

              <ControlPanel
                onInject={handleInject}
                onRefreshLogs={fetchLogs}
                isLoading={isLoading}
              />
            </div>

            <AdaptiveHealerPanel
              currentIncident={currentIncident}
              onAdaptiveHeal={handleAdaptiveHeal}
              onTeachFix={handleTeachFix}
              adaptiveResult={adaptiveResult}
              isLoading={isLoading}
            />
          </>
        )}

        {activeTab === 'playbooks' && <PlaybookManager />}
        {activeTab === 'logs' && <IncidentLogs logs={logs} />}

        {activeTab === 'settings' && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold">Platform Settings</h3>
            <p>Managed via CI/CD</p>
          </div>
        )}
      </main>
    </div>
  );
}