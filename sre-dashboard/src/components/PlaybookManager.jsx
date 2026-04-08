import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const MOCK_API = 'http://127.0.0.1:8000';

export default function PlaybookManager() {
  const [playbooks, setPlaybooks] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ id: '', error_pattern: '', steps: '', severity: 'INFO' });

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      const res = await fetch(`${MOCK_API}/playbooks`);
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data);
      }
    } catch (e) { console.error('Failed to fetch playbooks'); }
  };

  const handleSave = async () => {
    const payload = {
      id: formData.id,
      error_pattern: formData.error_pattern,
      steps: formData.steps.split(',').map(s => s.trim()),
      severity: formData.severity
    };
    
    try {
      const isNew = playbooks.every(p => p.id !== formData.id);
      const url = `${MOCK_API}/playbooks${isNew ? '' : `/${formData.id}`}`;
      const method = isNew ? 'POST' : 'PUT';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsEditing(null);
      fetchPlaybooks();
    } catch (e) {
      console.error('Failed to save playbook');
    }
  };

  const handleDelete = async (id) => {
    try {
      if (confirm('Delete playbook?')) {
        await fetch(`${MOCK_API}/playbooks/${id}`, { method: 'DELETE' });
        fetchPlaybooks();
      }
    } catch (e) {}
  };

  const openForm = (pb = null) => {
    if (pb) {
      setFormData({ 
        id: pb.id, 
        error_pattern: pb.error_pattern, 
        steps: pb.steps ? pb.steps.join(', ') : pb.action,
        severity: pb.severity 
      });
      setIsEditing(pb.id);
    } else {
      setFormData({ id: '', error_pattern: '', steps: '', severity: 'INFO' });
      setIsEditing('NEW');
    }
  };

  return (
    <div className="glass-card flex flex-col h-full animate-in fade-in transition-all">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3 tracking-tight">
            <BookOpen className="w-6 h-6 text-primary" />
            Playbook Manager
          </h2>
          <p className="text-text-secondary text-base mt-1">Dynamically manage autonomous healing rules</p>
        </div>
        {!isEditing && (
          <button onClick={() => openForm()} className="btn-primary">
            <Plus className="w-5 h-5" />
            New Playbook
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-surface/50 p-8 rounded-2xl border border-border shadow-medium space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <h3 className="text-text-primary text-lg font-bold tracking-wide">{isEditing === 'NEW' ? 'Create Playbook' : 'Edit Playbook'}</h3>
          <input className="input-field w-full h-12" placeholder="Playbook ID (e.g. mongo_restart)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={isEditing !== 'NEW'} />
          <input className="input-field w-full h-12" placeholder="Error Pattern" value={formData.error_pattern} onChange={e => setFormData({...formData, error_pattern: e.target.value})} />
          <input className="input-field w-full h-12" placeholder="Steps (comma separated items)" value={formData.steps} onChange={e => setFormData({...formData, steps: e.target.value})} />
          <select className="input-field w-full h-12" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <div className="flex gap-4 justify-end mt-8 pt-4 border-t border-border">
            <button onClick={() => setIsEditing(null)} className="btn-icon !px-6"><X className="w-4 h-4"/> Cancel</button>
            <button onClick={handleSave} className="bg-success/20 text-success hover:bg-success/30 px-6 py-3 rounded-2xl font-bold border border-success/30 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"><Save className="w-4 h-4"/> Save Record</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-4">
          {playbooks.map(pb => (
            <div key={pb.id} className="bg-surface/40 hover:bg-surface/80 border border-border p-6 rounded-2xl flex items-center justify-between group flex-wrap gap-4 transition-all duration-300 hover:shadow-medium">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-text-primary font-bold text-lg truncate">{pb.id}</h4>
                  <span className={`text-[10px] tracking-widest font-bold px-2.5 py-1 rounded-full border ${pb.severity === 'CRITICAL' ? 'bg-error/10 border-error/20 text-error' : pb.severity === 'WARNING' ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-secondary/10 border-secondary/20 text-secondary'}`}>
                    {pb.severity}
                  </span>
                </div>
                <p className="text-text-secondary text-sm truncate font-mono bg-background/50 px-3 py-1.5 rounded-lg border border-border inline-block mb-2">
                  Pattern: <span className="text-text-primary">{pb.error_pattern}</span>
                </p>
                <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
                  <span className="font-semibold text-primary">Steps:</span> 
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {(pb.steps && Array.isArray(pb.steps) ? pb.steps : (pb.steps ? [pb.steps] : [pb.action])).map((step, idx, arr) => (
                      <span key={idx} className="flex items-center whitespace-nowrap">
                        <span className="bg-surface border border-border px-2.5 py-1 rounded-md text-xs font-mono">{step}</span>
                        {idx < arr.length - 1 && <span className="mx-2 text-text-secondary opacity-50">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openForm(pb)} className="btn-icon"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(pb.id)} className="btn-icon hover:!bg-error/10 hover:!border-error hover:!text-error"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
