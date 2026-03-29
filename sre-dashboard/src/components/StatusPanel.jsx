import { Database, Server, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../utils';

export default function StatusPanel({ status }) {
  const isMongoHealthy = status.mongo === 'healthy';
  const isBackendHealthy = status.backend === 'healthy';

  const StatusCard = ({ title, icon: Icon, isHealthy }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group">
      {/* Glow effect based on health */}
      <div className={cn(
        "absolute -inset-2 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500",
        isHealthy ? "bg-emerald-500" : "bg-red-500"
      )} />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center border",
          isHealthy 
            ? "bg-emerald-500/10 border-emerald-500/20" 
            : "bg-red-500/10 border-red-500/20"
        )}>
          <Icon className={cn("w-6 h-6", isHealthy ? "text-emerald-400" : "text-red-400")} />
        </div>
        <div>
          <h3 className="text-zinc-100 font-medium">{title}</h3>
          <p className="text-zinc-500 text-sm mt-0.5">Status Check</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 relative z-10">
        <span className={cn(
          "text-sm font-medium",
          isHealthy ? "text-emerald-400" : "text-red-400"
        )}>
          {isHealthy ? 'Operational' : 'Down'}
        </span>
        {isHealthy ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500 animate-pulse" />
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatusCard title="MongoDB Cluster" icon={Database} isHealthy={isMongoHealthy} />
      <StatusCard title="Backend API" icon={Server} isHealthy={isBackendHealthy} />
    </div>
  );
}
