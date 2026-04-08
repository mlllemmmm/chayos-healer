import { AlertTriangle, Info, XOctagon, Clock } from 'lucide-react';
import { cn } from '../utils';

export default function IncidentLogs({ logs }) {
  const getIcon = (type) => {
    switch (type) {
      case 'error': return XOctagon;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'error': return 'text-error bg-error/10 border-error/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-secondary bg-secondary/10 border-secondary/20';
    }
  };

  return (
    <div className="glass-card flex flex-col h-[400px] !p-0 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border shrink-0 bg-surface/50">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 tracking-tight">
          System Event Logs
        </h2>
        <span className="bg-background text-text-secondary text-sm px-3 py-1 rounded-full font-mono border border-border">
          {logs.length} Events
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary">
            <Clock className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm font-medium tracking-wide">No events recorded</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const Icon = getIcon(log.type);
            return (
              <div 
                key={index} 
                className={cn(
                  "flex gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:translate-x-1 animate-in fade-in slide-in-from-left-4",
                  getColor(log.type)
                )}
              >
                <div className="shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-text-primary text-sm font-semibold">{log.message}</p>
                    {log.status && (
                       <span className={cn(
                          "ml-2 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border bg-background/80 font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm",
                          log.status === 'success' ? 'border-success/30 text-success' :
                          log.status === 'failure' ? 'border-error/30 text-error' :
                          'border-warning/30 text-warning'
                       )}>
                         {log.status === 'success' ? 'SUCCESS' : log.status === 'failure' ? 'FAILURE' : 'ACTIVE'}
                       </span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary font-mono flex items-center gap-2.5 flex-wrap">
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span className="opacity-50">•</span>
                    <span>{log.source || 'system'}</span>
                    
                    {log.event && (
                      <>
                        <span className="opacity-50">|</span>
                        <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary border border-secondary/20 tracking-wide">{log.event}</span>
                      </>
                    )}
                    {log.issue && (
                      <>
                        <span className="opacity-50">|</span>
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 tracking-wide">TARGET: {log.issue}</span>
                      </>
                    )}
                    {log.action && (
                      <>
                        <span className="opacity-50">|</span>
                        <span className="px-2 py-0.5 rounded-md bg-warning/10 text-warning border border-warning/20 tracking-wide">ACTION: {log.action}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
