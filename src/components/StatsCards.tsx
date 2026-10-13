import React from 'react';
import { BotStats, BotAccount } from '../types';
import { Users, Swords, Zap, Clock, Play, Pause, RefreshCw, Flame, Shield, ArrowUpRight } from 'lucide-react';

interface StatsCardsProps {
  stats: BotStats;
  accounts: BotAccount[];
  onStartAll: () => void;
  onPauseAll: () => void;
  onSync: () => void;
  onOpenAddModal: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  accounts,
  onStartAll,
  onPauseAll,
  onSync,
  onOpenAddModal,
}) => {
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const loneWolfCount = accounts.filter(a => (a.mode === 'LONE_WOLF' || ((a.level || 1) >= 3))).length;
  const brCount = accounts.filter(a => (a.mode === 'BR' || ((a.level || 1) < 3))).length;

  return (
    <div className="space-y-4">
      {/* Top Banner: Reactor Dial & High-Level Telemetry */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-900/40 bg-gradient-to-r from-[#0a1226]/95 via-[#0c1630]/90 to-[#080d19]/95 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Glowing Circular Reactor Gauge */}
          <div className="flex items-center gap-5">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              {/* Radar Sweep Effect */}
              <div className="absolute inset-2 rounded-full border border-cyan-500/20 bg-gradient-to-tr from-cyan-500/10 to-transparent animate-spin duration-3000" />
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  className="stroke-slate-800"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  className="stroke-cyan-400"
                  strokeWidth="5"
                  strokeDasharray="238.7"
                  strokeDashoffset={Math.max(20, 238.7 - Math.min(238.7, (stats.total_gained_exp / 10000) * 238.7))}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.8))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <Zap className="h-5 w-5 text-cyan-400" />
                <span className="font-mono text-[10px] font-bold text-cyan-200 mt-0.5">YIELD</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  ⚡ REAL-TIME EXP HARVEST
                </span>
                <span className="text-xs font-mono text-slate-400">Singapore Cluster</span>
              </div>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight font-mono text-white flex items-baseline gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                  +{stats.total_gained_exp.toLocaleString()}
                </span>
                <span className="text-xs font-normal text-slate-400 font-sans">EXP Yielded</span>
              </h2>
              <div className="mt-1 flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{stats.exp_rate_per_hour.toLocaleString()} EXP/hr
                </span>
                <span>•</span>
                <span>{stats.total_matches.toLocaleString()} Matches Concluded</span>
              </div>
            </div>
          </div>

          {/* Right: Mode Allocation & Quick Batch Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Mode Split Badge */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-3.5 py-2 border border-slate-800 text-xs font-mono">
              <span className="text-purple-400 flex items-center gap-1 font-bold">
                🐺 {loneWolfCount} Lone Wolf
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-blue-400 flex items-center gap-1 font-bold">
                🪂 {brCount} Battle Royale
              </span>
            </div>

            {/* Quick Batch Controls */}
            <button
              onClick={onStartAll}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all active:scale-95"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Resume All</span>
            </button>

            <button
              onClick={onPauseAll}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600/20 px-3.5 py-2 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition-all active:scale-95"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause All</span>
            </button>

            <button
              onClick={onSync}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
              title="Force sync stats from Render backend"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry 4-Card Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Verified Bot Accounts */}
        <div className="relative overflow-hidden rounded-xl border border-blue-900/30 bg-[#0e1726]/80 p-4 backdrop-blur-sm transition-all hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Verified Bots</span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
              {stats.active_workers}
            </span>
            <span className="font-mono text-xs text-slate-500">
              / {stats.total_accounts} Online
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Backend Verified</span>
          </div>
        </div>

        {/* Metric 2: Matches Executed */}
        <div className="relative overflow-hidden rounded-xl border border-blue-900/30 bg-[#0e1726]/80 p-4 backdrop-blur-sm transition-all hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Matches</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Swords className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
              {stats.total_matches.toLocaleString()}
            </span>
            {stats.total_matches_started !== undefined && stats.total_matches_started > 0 && (
              <span className="font-mono text-xs text-indigo-300">
                ({stats.total_matches_started} started)
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400">
            BR & Lone Wolf matchmaker
          </div>
        </div>

        {/* Metric 3: Mode Auto-Switch Engine */}
        <div className="relative overflow-hidden rounded-xl border border-blue-900/30 bg-[#0e1726]/80 p-4 backdrop-blur-sm transition-all hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Mode Engine</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold tracking-tight text-purple-300">
              Lvl &lt; 3 ➔ BR
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-purple-300/80">
            Auto-switches to 🐺 at Lvl 3
          </div>
        </div>

        {/* Metric 4: Engine Uptime */}
        <div className="relative overflow-hidden rounded-xl border border-blue-900/30 bg-[#0e1726]/80 p-4 backdrop-blur-sm transition-all hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Backend Uptime</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
              {formatUptime(stats.uptime)}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400">
            TCP Gateway Persistent
          </div>
        </div>
      </div>
    </div>
  );
};
