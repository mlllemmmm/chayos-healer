import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Database } from 'lucide-react';

const MOCK_API = 'http://127.0.0.1:8000';

export default function MetricsSection({ status }) {
  const [latestMetrics, setLatestMetrics] = useState({ cpu: 0, memory: 0 });

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${MOCK_API}/metrics/history`);
        if (res.ok) {
          const history = await res.json();
          if (history && history.length > 0) {
            setLatestMetrics(history[history.length - 1]);
          }
        }
      } catch (e) {}
    };
    fetchLatest();
    const interval = setInterval(fetchLatest, 2000);
    return () => clearInterval(interval);
  }, []);

  const isBackendHealthy = status?.backend === 'healthy';
  const isMongoHealthy = status?.mongo === 'healthy';

  const cards = [
    { label: 'CPU Load', value: `${latestMetrics.cpu.toFixed(1)}%`, icon: Activity, color: 'text-primary', outline: 'border-primary/20' },
    { label: 'Memory Allocation', value: `${latestMetrics.memory.toFixed(1)}%`, icon: Server, color: 'text-secondary', outline: 'border-secondary/20' },
    { label: 'Backend API', value: isBackendHealthy ? 'ONLINE' : 'DOWN', icon: Server, color: isBackendHealthy ? 'text-success' : 'text-error', outline: isBackendHealthy ? 'border-success/20' : 'border-error/20' },
    { label: 'Database Cluster', value: isMongoHealthy ? 'ONLINE' : 'DOWN', icon: Database, color: isMongoHealthy ? 'text-success' : 'text-error', outline: isMongoHealthy ? 'border-success/20' : 'border-error/20' },
  ];

  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative snap-start snap-always px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.3 }}
        className="w-full max-w-5xl"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-text-primary mb-4">Core Telemetrics</h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">Live infrastructure vitals streaming directly from the container matrix.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="bg-surface/50 backdrop-blur-xl border border-border p-8 rounded-3xl flex flex-col items-center w-64 text-center group hover:bg-surface/80 hover:border-text-secondary/20 transition-all duration-300"
            >
              <div className={`p-4 rounded-2xl bg-background mb-6 ${card.color} border ${card.outline} group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-300 shadow-medium`}>
                <card.icon className="w-8 h-8" />
              </div>
              <p className="text-text-secondary text-xs font-bold tracking-[0.2em] uppercase mb-3">{card.label}</p>
              <h3 className={`text-4xl font-black ${card.value === 'DOWN' ? 'text-error' : 'text-text-primary'} tabular-nums`}>{card.value}</h3>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
