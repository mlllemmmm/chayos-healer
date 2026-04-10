import { BookOpen, Trophy } from 'lucide-react';

export default function LearningInsights({ experiences, promotionCandidates }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm flex flex-col min-h-[360px]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Learned Experiences
          </h2>
          <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-md border border-zinc-700">
            {experiences.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {experiences.length === 0 ? (
            <p className="text-zinc-500 text-sm">No learned experiences yet.</p>
          ) : (
            experiences.slice(0, 20).map((exp, index) => (
              <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-indigo-400">{exp.action_id}</span>
                  <span className={`text-xs px-2 py-1 rounded-md ${
                    exp.success ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                  }`}>
                    {exp.success ? 'success' : 'failed'}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 mt-2">
                  service: <span className="text-zinc-100">{exp.context?.service}</span>
                  <span className="mx-2 text-zinc-600">•</span>
                  symptom: <span className="text-zinc-100">{exp.context?.symptom}</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  reward: {exp.reward} • source: {exp.source}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm flex flex-col min-h-[360px]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            Promotion Candidates
          </h2>
          <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-md border border-zinc-700">
            {promotionCandidates.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {promotionCandidates.length === 0 ? (
            <p className="text-zinc-500 text-sm">No candidates ready for promotion.</p>
          ) : (
            promotionCandidates.map((item, index) => (
              <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="text-sm text-zinc-100 font-medium">
                  Action: <span className="font-mono text-emerald-400">{item.key?.[6]}</span>
                </p>
                <p className="text-xs text-zinc-400 mt-2">
                  Attempts: {item.attempts}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Success Rate: {item.success_rate}
                </p>
                <p className="text-xs text-zinc-500 mt-2 break-all">
                  Signature: {JSON.stringify(item.key)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}