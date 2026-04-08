import { useState, useEffect } from 'react';
import StatusPanel from '../components/StatusPanel';
import ControlPanel from '../components/ControlPanel';
import IncidentLogs from '../components/IncidentLogs';
import MetricsChart from '../components/MetricsChart';
import ChaosPanel from '../components/ChaosPanel';
import ScalerWidget from '../components/ScalerWidget';
import AlertToasts from '../components/AlertToasts';
import Sidebar from '../components/Sidebar';
import PlaybookManager from '../components/PlaybookManager';

const MOCK_API = 'http://127.0.0.1:8000';

export default function DashboardLayout({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState({ mongo: 'healthy', backend: 'healthy' });
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    const int = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 2000);
    return () => clearInterval(int);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${MOCK_API}/status`);
      if (res.ok) setStatus(await res.json());
    } catch (e) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${MOCK_API}/logs`);
      if (res.ok) setLogs(await res.json());
    } catch (e) {}
  };

  const handleInject = async (type) => {
    setIsLoading(true);
    try {
      await fetch(`${MOCK_API}/inject-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchLogs();
    } catch (e) {}
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-text-primary relative font-sans align-baseline">
      <AlertToasts />
      
      {/* Background Parallax Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vh] bg-primary/20 rounded-full blur-[120px] animate-blob-drift" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-secondary/15 rounded-full blur-[120px] animate-blob-drift" style={{ animationDelay: '-10s', animationDirection: 'reverse' }} />
      </div>

      <div className="z-20 relative h-full flex flex-col">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      </div>

      <main className="flex-1 overflow-y-auto w-full relative z-10 scroll-smooth">
        <div className="max-w-6xl mx-auto p-8 relative w-full space-y-8">
          <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary pb-1">
              System Operations
            </h1>
            <p className="text-text-secondary mt-3 text-base max-w-xl">
              Monitor vital system parameters, manage incident logs, and control failure injection routines in real-time.
            </p>
          </header>

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <StatusPanel status={status} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <MetricsChart />
                <div className="lg:col-span-1">
                  <ScalerWidget />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <IncidentLogs logs={logs} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                  <ChaosPanel />
                  <ControlPanel
                    onInject={handleInject}
                    onRefreshLogs={fetchLogs}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'playbooks' && (
            <div className="h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <PlaybookManager />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <IncidentLogs logs={logs} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass-card text-center py-20 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <h3 className="text-2xl font-bold text-text-primary mb-3">Platform Settings</h3>
              <p className="text-text-secondary">Agent configurations and alerting rules are managed via CI/CD for this environment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}