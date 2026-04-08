import { motion } from 'framer-motion';
import { Zap, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export default function ChaosSection({ onInject, isLoading }) {
  const chaosTypes = [
    { type: 'port_conflict', label: 'Port Conflict', desc: 'Spawns rogue process binding to crucial system ports', icon: ShieldAlert, color: 'text-error', border: 'border-error/20', bg: 'bg-error/10' },
    { type: 'network_isolate', label: 'Network Isolation', desc: 'Drops container out of the overlay network entirely', icon: AlertTriangle, color: 'text-warning', border: 'border-warning/20', bg: 'bg-warning/10' },
    { type: 'container_memory_pressure', label: 'Memory Overload', desc: 'Rapidly allocates 500MB internally to spike OOM limits', icon: Zap, color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/10' },
    { type: 'kill_backend', label: 'Container Kill', desc: 'Sends SIGKILL abruptly tearing down the backend image', icon: Cpu, color: 'text-error', border: 'border-error/20', bg: 'bg-error/10' }
  ];

  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative snap-start snap-always px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.3 }}
        className="w-full max-w-5xl"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">Chaos Injection Engine</h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">Introduce synthetic anomalies to validate the autonomous auto-recovery matrix.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chaosTypes.map((chaos, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className={`bg-surface/30 backdrop-blur-md border ${chaos.border} p-6 rounded-3xl flex items-start gap-6 group hover:bg-surface/80 transition-colors relative overflow-hidden`}
            >
              <div className={`p-4 rounded-2xl ${chaos.bg} ${chaos.color} shadow-medium`}>
                <chaos.icon className="w-8 h-8" />
              </div>
              <div className="flex-1 mt-1">
                <h3 className="text-xl font-bold text-text-primary mb-1 tracking-wide">{chaos.label}</h3>
                <p className="text-text-secondary text-sm font-medium leading-relaxed">{chaos.desc}</p>
                <button
                  onClick={() => onInject(chaos.type)}
                  disabled={isLoading}
                  className="mt-6 w-full py-3 rounded-xl bg-border hover:bg-text-secondary/20 font-bold text-text-primary text-sm tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'EXECUTING...' : 'TRIGGER INJECTION'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
