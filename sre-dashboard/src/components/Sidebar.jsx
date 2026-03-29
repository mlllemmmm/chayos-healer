import { LayoutDashboard, ScrollText, Settings, LogOut, Activity } from 'lucide-react';
import { cn } from '../utils';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logs', label: 'Incident Logs', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-semibold text-zinc-100 tracking-tight">SRE Monitor</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === item.id 
                ? "bg-zinc-800 text-zinc-100 shadow-sm shadow-black/20" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-indigo-400" : "text-zinc-500")} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800 shrink-0">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
