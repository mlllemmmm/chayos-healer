import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_API = 'http://127.0.0.1:8000';

export default function GraphSection() {
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
    <section className="h-screen w-full flex flex-col items-center justify-center relative snap-start snap-always px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.3 }}
        className="w-full max-w-6xl h-[75vh] bg-surface/40 backdrop-blur-2xl border border-border rounded-[2rem] p-8 md:p-12 shadow-strong flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-text-secondary/20 to-transparent" />
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
           <div>
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Resource Consumption Monitor</h2>
             <p className="text-text-secondary mt-2 text-base">Live graph streaming memory and CPU load vectors.</p>
           </div>
           <div className="flex gap-4">
             <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest bg-primary/10 px-4 py-2 rounded-full border border-primary/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/> CPU LOAD
             </div>
             <div className="flex items-center gap-2 text-secondary font-bold text-xs tracking-widest bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"/> MEMORY ALLOC
             </div>
           </div>
        </div>
        
        <div className="flex-1 w-full relative">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3346" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={16} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} axisLine={false} tickLine={false} tickMargin={16} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(11, 18, 32, 0.9)', borderColor: '#2a3346', color: '#F8FAFC', borderRadius: '16px', backdropFilter: 'blur(12px)', padding: '16px' }}
                  itemStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  cursor={{ stroke: '#2a3346', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line type="monotone" dataKey="cpu" stroke="#f97316" strokeWidth={4} dot={false} name="CPU %" activeDot={{ r: 8, fill: '#f97316', stroke: '#05070d', strokeWidth: 3 }} />
                <Line type="monotone" dataKey="memory" stroke="#0ea5e9" strokeWidth={4} dot={false} name="Memory %" activeDot={{ r: 8, fill: '#0ea5e9', stroke: '#05070d', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary text-base font-medium tracking-wide">
               <Activity className="w-6 h-6 mr-3 animate-spin opacity-50" /> Initializing data streams...
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
