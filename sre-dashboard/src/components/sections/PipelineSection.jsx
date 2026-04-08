import { motion } from 'framer-motion';
import { Search, Cpu, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PipelineSection() {
  const steps = [
    { label: 'Detect', desc: 'Anomaly identified in streaming metric vectors.', icon: Search, color: 'text-primary' },
    { label: 'Match', desc: 'Correlating signature with autonomous Playbooks.', icon: Cpu, color: 'text-secondary' },
    { label: 'Execute', desc: 'Remediation dispatched safely to Docker daemon.', icon: Wrench, color: 'text-warning' },
    { label: 'Verify', desc: 'Healthchecks run sequentially to clear incident.', icon: ShieldCheck, color: 'text-success' },
  ];

  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative snap-start snap-always px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">Autonomous Healing Pipeline</h2>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">Zero-touch auto-remediation continuously resolving matrix disturbances.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-6xl">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2, duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex items-center gap-4 md:gap-8 flex-col md:flex-row relative"
          >
            <div className="bg-surface/50 backdrop-blur-xl border border-border p-8 rounded-full w-48 h-48 flex flex-col items-center justify-center group hover:bg-surface transition-colors shadow-medium">
              <step.icon className={`w-10 h-10 ${step.color} mb-4 group-hover:scale-110 transition-transform duration-300`} />
              <h3 className="text-text-primary font-bold text-lg">{step.label}</h3>
              <p className="text-text-secondary text-xs text-center mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 w-full left-0">{step.desc}</p>
            </div>
            {idx < steps.length - 1 && (
              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="rotate-90 md:rotate-0 text-border"
              >
                <ArrowRight className="w-8 h-8" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
