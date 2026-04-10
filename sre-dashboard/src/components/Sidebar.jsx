import {
  LayoutDashboard,
  ScrollText,
  Settings,
  LogOut,
  Activity,
  BookOpen,
  Brain,
} from 'lucide-react';
import { cn } from '../utils';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
    { id: 'logs', label: 'Incident Logs', icon: ScrollText },
    { id: 'learning', label: 'Adaptive Learning', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-card !rounded-none !border-y-0 !border-l-0 !shadow-none flex flex-col h-full shrink-0 z-30">
      <div className="h-20 flex items-center px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(124,92,255,0.2)]">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-text-primary tracking-tight text-lg">
            SRE Monitor
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border",
              activeTab === item.id
                ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(124,92,255,0.1)]"
                : "text-text-secondary hover:text-text-primary hover:bg-surface border-transparent hover:border-border"
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-colors",
                activeTab === item.id ? "text-primary" : "text-text-secondary"
              )}
            />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-border shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-secondary hover:text-error hover:bg-error/10 hover:border-error/20 border border-transparent rounded-xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5" />
          Disconnect
        </button>
      </div>
    </aside>
  );
}