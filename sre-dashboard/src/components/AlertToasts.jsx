import { useEffect, useState } from 'react';
import { AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const MOCK_API = 'http://127.0.0.1:8000';

export default function AlertToasts() {
  const [toasts, setToasts] = useState([]);
  const [seenLogs, setSeenLogs] = useState(new Set());

  useEffect(() => {
    const fetchLogsForAlerts = async () => {
      try {
        const res = await fetch(`${MOCK_API}/logs`);
        if (res.ok) {
          const logs = await res.json();
          const newAlerts = [];
          
          logs.forEach((log, index) => {
            const uniqueId = log.timestamp + index;
            if (!seenLogs.has(uniqueId)) {
              seenLogs.add(uniqueId);
              
              if (log.event === 'alert') {
                let type = 'info';
                if (log.issue?.includes('critical')) type = 'critical';
                if (log.issue?.includes('warning')) type = 'warning';
                
                newAlerts.push({
                  id: uniqueId,
                  message: log.message,
                  type
                });
              }
            }
          });
          
          if (newAlerts.length > 0) {
            setToasts(prev => [...prev, ...newAlerts]);
          }
        }
      } catch (e) {}
    };

    fetchLogsForAlerts();
    const int = setInterval(fetchLogsForAlerts, 2000);
    return () => clearInterval(int);
  }, [seenLogs]);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none w-80">
      {toasts.map(toast => {
        const colors = {
          critical: 'bg-error/10 border-error/20 text-error shadow-[0_4px_20px_rgba(239,68,68,0.15)]',
          warning: 'bg-warning/10 border-warning/20 text-warning shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
          info: 'bg-secondary/10 border-secondary/20 text-secondary shadow-[0_4px_20px_rgba(0,224,255,0.15)]'
        }[toast.type];

        const Icon = {
          critical: AlertCircle,
          warning: AlertTriangle,
          info: Info
        }[toast.type];

        return (
          <div key={toast.id} className={`flex items-start gap-3 p-5 rounded-2xl border backdrop-blur-xl pointer-events-auto animate-in fade-in slide-in-from-right-8 ${colors}`}>
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold mb-1 uppercase tracking-widest">{toast.type} ALERT</h4>
              <p className="text-xs font-medium text-text-primary/90">{toast.message}</p>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-text-secondary hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
