import { Database, Server, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../utils';

export default function StatusPanel({ status }) {
  const isMongoHealthy = status.mongo === 'healthy';
  const isBackendHealthy = status.backend === 'healthy';

  const StatusCard = ({ title, icon: Icon, isHealthy }) => (
    <div className="glass-card !p-5 flex items-center justify-between relative overflow-hidden group hover:translate-y-[-2px] transition-transform duration-300">
      {/* Glow effect based on health */}
      <div className={cn(
        "absolute -inset-2 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500",
        isHealthy ? "bg-success" : "bg-error"
      )} />
      
      <div className="flex items-center gap-4 relative z-10 w-full">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center border",
          isHealthy 
            ? "bg-success/10 border-success/20" 
            : "bg-error/10 border-error/20"
        )}>
          <Icon className={cn("w-6 h-6", isHealthy ? "text-success" : "text-error")} />
        </div>
        <div className="flex-1">
          <h3 className="text-text-primary text-base font-bold">{title}</h3>
          <p className="text-text-secondary text-sm mt-0.5">Status Check</p>
        </div>
      
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold tracking-wide",
            isHealthy ? "text-success" : "text-error"
          )}>
            {isHealthy ? 'Operational' : 'Down'}
          </span>
          {isHealthy ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <XCircle className="w-5 h-5 text-error animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatusCard title="MongoDB Cluster" icon={Database} isHealthy={isMongoHealthy} />
      <StatusCard title="Backend API" icon={Server} isHealthy={isBackendHealthy} />
    </div>
  );
}
