import { motion } from 'framer-motion';

export default function ScrollNav({ sections, activeSection, onNavigate }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-5">
      {sections.map((sec, idx) => (
        <button
          key={idx}
          onClick={() => onNavigate(idx)}
          className="relative group flex items-center justify-end"
        >
          <span className={`absolute right-8 px-3 py-1.5 rounded-md bg-surface/80 text-[10px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border backdrop-blur-md ${activeSection === idx ? 'text-primary' : 'text-text-secondary'}`}>
            {sec.label}
          </span>
          <motion.div
            layout
            className={`w-3 h-3 rounded-full transition-colors ${activeSection === idx ? 'bg-primary shadow-[0_0_12px_rgba(249,115,22,0.8)] scale-110' : 'bg-text-secondary/30 hover:bg-text-secondary/60'}`}
          />
        </button>
      ))}
    </div>
  );
}
