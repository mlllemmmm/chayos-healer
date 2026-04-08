import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative snap-start snap-always shrink-0 hero-glow-arc">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          System Core Active
        </div>
        <h1 className="text-5xl md:text-[5rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-text-secondary leading-tight max-w-4xl mx-auto">
          Autonomous Chaos<br/>Engineering System
        </h1>
        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto font-medium mt-6 leading-relaxed">
          A self-healing infrastructure matrix designed to safely inject failures, detect anomalies instantly, and execute autonomous recovery routines zero-touch.
        </p>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-12 text-text-secondary/50 cursor-pointer hover:text-text-secondary transition-colors"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}
