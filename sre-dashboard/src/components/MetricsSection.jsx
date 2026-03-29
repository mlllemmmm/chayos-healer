import { Cpu, MemoryStick, Activity } from 'lucide-react';
import { cn } from '../utils';

export default function MetricsSection({ metrics }) {
  const MetricCard = ({ title, value, unit, icon: Icon, trend, colorClass }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg bg-zinc-800", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-md",
          trend > 0 ? "text-emerald-400 bg-emerald-400/10" : 
          trend < 0 ? "text-red-400 bg-red-400/10" : 
          "text-zinc-400 bg-zinc-800"
        )}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
      <div>
        <h4 className="text-zinc-400 text-sm font-medium mb-1">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-zinc-100 leading-none">{value}</span>
          <span className="text-sm font-medium text-zinc-500">{unit}</span>
        </div>
      </div>
      
      {/* Decorative background graph simulation */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-800/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard 
        title="CPU Utilization" 
        value={metrics.cpu.toFixed(1)} 
        unit="%" 
        icon={Cpu} 
        trend={2.4} 
        colorClass="text-indigo-400" 
      />
      <MetricCard 
        title="Memory Usage" 
        value={metrics.memory.toFixed(1)} 
        unit="GB" 
        icon={MemoryStick} 
        trend={0.5} 
        colorClass="text-fuchsia-400" 
      />
      <MetricCard 
        title="System Uptime" 
        value={metrics.uptime.toFixed(2)} 
        unit="%" 
        icon={Activity} 
        trend={0.0} 
        colorClass="text-emerald-400" 
      />
    </div>
  );
}
