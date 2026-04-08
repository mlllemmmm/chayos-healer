import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const MOCK_API = 'http://127.0.0.1:8000';

export default function MetricsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${MOCK_API}/metrics/history`);
        if (res.ok) {
          const history = await res.json();
          const formatted = history.map(item => {
            const d = new Date(item.timestamp * 1000);
            return {
              time: `${d.getMinutes()}:${d.getSeconds().toString().padStart(2, '0')}`,
              cpu: item.cpu,
              memory: item.memory
            };
          });
          setData(formatted);
        }
      } catch (e) {}
    };

    fetchHistory();
    const int = setInterval(fetchHistory, 2000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="glass-card col-span-2 flex flex-col h-[300px]">
      <h4 className="text-text-primary text-xl font-bold flex items-center gap-2 mb-6 tracking-tight">
        <Activity className="w-5 h-5 text-secondary animate-pulse" />
        System Metrics
        <span className="ml-2 text-xs font-mono text-text-secondary bg-surface border border-border px-2 py-1 rounded-md">
          REAL-TIME
        </span>
      </h4>
      <div className="flex-1 w-full relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="time" stroke="#9AA4B2" fontSize={12} tickMargin={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#9AA4B2" fontSize={12} domain={[0, 100]} axisLine={false} tickLine={false} tickMargin={8} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(18, 24, 38, 0.9)', borderColor: '#1F2937', color: '#E6EAF2', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                itemStyle={{ color: '#E6EAF2', fontWeight: '500' }}
                cursor={{ stroke: '#1F2937', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line type="monotone" dataKey="cpu" stroke="#7C5CFF" strokeWidth={3} dot={false} name="CPU %" activeDot={{ r: 6, fill: '#7C5CFF', stroke: '#0B0F1A', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="memory" stroke="#00E0FF" strokeWidth={3} dot={false} name="Memory %" activeDot={{ r: 6, fill: '#00E0FF', stroke: '#0B0F1A', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary text-sm font-medium tracking-wide">
             <Activity className="w-5 h-5 mr-3 animate-spin opacity-50" /> Initializing data streams...
          </div>
        )}
      </div>
    </div>
  );
}
