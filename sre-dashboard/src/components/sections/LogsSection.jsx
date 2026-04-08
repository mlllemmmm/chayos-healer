import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function LogsSection({ logs }) {
  // Get recent 6 logs for cleaner display
  const displayLogs = (logs || []).slice(0, 6);

  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative snap-start snap-always px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.3 }}
        className="w-full max-w-4xl"
      >
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">Audit Timeline</h2>
            <p className="text-text-secondary text-base">Chronological ledger of node disturbances and system actions.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/> 
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Live Stream</span>
          </div>
        </div>

        <div className="bg-surface/40 backdrop-blur-xl border border-border rounded-3xl p-8 relative shadow-strong">
          <div className="absolute left-14 top-12 bottom-12 w-px bg-border/50 hidden md:block" />
          
          <div className="space-y-6">
            {displayLogs.length > 0 ? displayLogs.map((log, idx) => (
              <motion.div 
                key={log.timestamp + idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="flex items-start gap-6 relative group"
              >
                <div className="hidden md:flex flex-col items-center mt-1 z-10 bg-background rounded-full">
                  <div className={`w-3 h-3 rounded-full ${log.event === 'alert' ? (log.issue?.includes('critical') ? 'bg-error shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-warning shadow-[0_0_10px_rgba(245,158,11,0.8)]') : (log.event === 'heal' ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-text-secondary')} group-hover:scale-150 transition-transform`} />
                </div>
                <div className={`flex-1 bg-background/50 border border-border p-5 rounded-2xl group-hover:border-text-secondary/30 transition-colors ${log.event === 'alert' && log.issue?.includes('critical') ? 'border-l-4 border-l-error' : ''}`}>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-mono text-text-secondary">{new Date(log.timestamp * 1000).toLocaleTimeString()}</span>
                     <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border border-border bg-surface text-text-secondary">
                        {log.event}
                     </span>
                   </div>
                   <p className="text-text-primary text-sm font-medium">{log.message}</p>
                   {log.action && (
                     <div className="mt-3 text-xs bg-surface/80 p-2 rounded-lg font-mono text-secondary inline-block">
                        ↳ Executed: {log.action}
                     </div>
                   )}
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-20 text-text-secondary opacity-50 flex flex-col items-center">
                <Activity className="w-8 h-8 mb-4 animate-pulse" />
                <p>System operating normally. No recent events logged.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
