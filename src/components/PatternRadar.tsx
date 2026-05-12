import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { CurhatEntry, HistoryStats } from '../types';
import { cn } from '../lib/utils';
import { Activity, ShieldCheck, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PatternRadarProps {
  entries: CurhatEntry[];
  onSessionSelect: (session: CurhatEntry) => void;
}

export function PatternRadar({ entries, onSessionSelect }: PatternRadarProps) {
  const stats = useMemo(() => {
    const s: HistoryStats = {
      greenCount: entries.filter(e => e.lastAnalysis?.flag === 'GREEN').length,
      yellowCount: entries.filter(e => e.lastAnalysis?.flag === 'YELLOW').length,
      redCount: entries.filter(e => e.lastAnalysis?.flag === 'RED').length,
      commonThemes: [],
    };

    const themeMap = new Map<string, number>();
    entries.forEach(e => {
      e.lastAnalysis?.labels?.forEach(l => {
        themeMap.set(l, (themeMap.get(l) || 0) + 1);
      });
    });

    s.commonThemes = Array.from(themeMap.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return s;
  }, [entries]);

  const chartData = useMemo(() => {
    return [...entries].reverse().map((e, i) => ({
      name: i + 1,
      score: e.lastAnalysis?.flag === 'GREEN' ? 3 : e.lastAnalysis?.flag === 'YELLOW' ? 2 : 1,
      date: new Date(e.timestamp).toLocaleDateString()
    }));
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="text-4xl">📭</div>
        <p className="text-slate-400 dark:text-slate-500 font-display font-bold leading-relaxed max-w-xs mx-auto">
          Belum ada data vibe yang terekam. <br/>
          Mulai curhat sekarang biar radar lo aktif!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard 
          icon={<ShieldCheck className="text-emerald-500" size={20} />} 
          count={stats.greenCount} 
          label="Green Flags" 
          color="bg-emerald-50"
        />
        <StatCard 
          icon={<AlertTriangle className="text-amber-500" size={20} />} 
          count={stats.yellowCount} 
          label="Yellow Flags" 
          color="bg-amber-50"
        />
        <StatCard 
          icon={<AlertCircle className="text-rose-500" size={20} />} 
          count={stats.redCount} 
          label="Red Flags" 
          color="bg-rose-50"
        />
      </div>

      <div className="skeuo-card p-4 sm:p-8 noise-bg">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl">
              <Activity size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-display font-black uppercase tracking-tight text-slate-800 dark:text-white leading-tight">Vibe Trajectory</h3>
              <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Relationship Health Radar</p>
            </div>
          </div>
        </div>
        
        <div className="h-48 sm:h-56 w-full -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[0, 4]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-white/10 p-3 rounded-2xl shadow-2xl text-xs font-bold text-white uppercase tracking-widest">
                        {payload[0].payload.date}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#000" 
                className="dark:stroke-white"
                fillOpacity={1} 
                fill="url(#colorScore)" 
                strokeWidth={4}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="skeuo-card p-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Recurring Themes</h3>
          <div className="space-y-6">
            {stats.commonThemes.map((t, i) => (
              <div key={t.theme} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-300">
                  <span>{t.theme}</span>
                  <span className="text-slate-400">{t.count} Analysts</span>
                </div>
                <div className="h-1 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(t.count / entries.length) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-slate-900 dark:bg-white rounded-full" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Session Archive</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {entries.map(e => (
              <button
                key={e.id}
                onClick={() => onSessionSelect(e)}
                className="w-full skeuo-card p-5 text-left flex items-center justify-between group hover:border-slate-900 dark:hover:border-white transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full shadow-sm ring-4 ring-white dark:ring-slate-900 transition-all group-hover:scale-125",
                    e.lastAnalysis?.flag === 'GREEN' ? "bg-emerald-400 shadow-emerald-200" :
                    e.lastAnalysis?.flag === 'YELLOW' ? "bg-amber-400 shadow-amber-200" : "bg-rose-400 shadow-rose-200"
                  )} />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mb-0.5">
                      {e.messages[0].content}
                    </p>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(e.timestamp).toLocaleDateString(['id-ID'], { day: 'numeric', month: 'short' })}
                       </span>
                       <span className="w-1 h-1 rounded-full bg-slate-300" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {e.messages.length} MSGS
                       </span>
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={14} className="text-slate-900 dark:text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, count, label, color }: { icon: any, count: number, label: string, color: string }) {
  return (
    <div className={cn(
      "skeuo-card p-4 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]", 
      color,
      color === 'bg-emerald-50' ? 'dark:bg-emerald-950/20 dark:border-emerald-900/30' :
      color === 'bg-amber-50' ? 'dark:bg-amber-950/20 dark:border-amber-900/30' :
      'dark:bg-rose-950/20 dark:border-rose-900/30'
    )}>
      <div className="mb-2 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
        {icon}
      </div>
      <span className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200">{count}</span>
      <span className="text-[10px] uppercase tracking-tighter font-bold text-slate-400 dark:text-slate-500">{label}</span>
    </div>
  );
}
