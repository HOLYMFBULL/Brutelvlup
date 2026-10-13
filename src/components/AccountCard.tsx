import React, { useState } from 'react';
import { BotAccount, GameMode } from '../types';
import { Play, Pause, Smartphone, Trash2, Copy, Check, RefreshCw, RotateCcw, Swords, Shield, Lock, Unlock } from 'lucide-react';

interface AccountCardProps {
  account: BotAccount;
  onToggleStatus: (uid: string) => void;
  onRefresh: (uid: string) => void;
  onRestart: (uid: string) => void;
  onInspectDevice: (account: BotAccount) => void;
  onRemove: (uid: string, authUid?: string) => void;
  onSetMode: (uid: string, mode: GameMode) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onToggleStatus,
  onRefresh,
  onRestart,
  onInspectDevice,
  onRemove,
  onSetMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [modeLoading, setModeLoading] = useState(false);

  const level = account.level || 1;
  const isLoneWolfUnlocked = level >= 3;
  const currentMode = account.mode || (level < 3 ? 'BR' : 'LONE_WOLF');
  const isLoneWolf = currentMode === 'LONE_WOLF';

  const progressPercent = account.progress_pct !== undefined 
    ? account.progress_pct 
    : Math.min(100, Math.max(0, Math.round(((account.current_exp % 1000) / 1000) * 100)));

  const handleCopyUid = () => {
    navigator.clipboard.writeText(account.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleMode = async () => {
    if (!isLoneWolfUnlocked) return;
    setModeLoading(true);
    const nextMode: GameMode = isLoneWolf ? 'BR' : 'LONE_WOLF';
    await onSetMode(account.uid, nextMode);
    setModeLoading(false);
  };

  const isPaused = account.is_paused || account.status === 'PAUSED' || account.status === 'STOPPED';
  const isInMatch = account.status === 'IN_MATCH' || (typeof account.status === 'string' && account.status.startsWith('IN_MATCH'));
  const isSearching = typeof account.status === 'string' && account.status.startsWith('SEARCHING');

  // Circumference for radial progress ring (radius 22 -> 2 * PI * 22 ~= 138.2)
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 ${
        isInMatch
          ? 'border-cyan-500/60 bg-gradient-to-b from-[#0e1c33] to-[#0a101d] shadow-[0_0_25px_rgba(6,182,212,0.2)]'
          : isPaused
          ? 'border-slate-800 bg-[#0a0f1d]/70 opacity-80'
          : 'border-blue-900/40 bg-gradient-to-b from-[#0d1628]/95 to-[#080d19]/95 hover:border-blue-600/50 shadow-lg'
      }`}
    >
      {/* Glow Accent Stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isLoneWolf
            ? 'bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.7)]'
            : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]'
        }`}
      />

      {/* Header Row: Radial Progress Ring + Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Radial Level Ring */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg className="h-14 w-14 -rotate-90 transform">
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-slate-800/80"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                className={`transition-all duration-1000 ease-out ${
                  isLoneWolf ? 'stroke-purple-400' : 'stroke-cyan-400'
                }`}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: isLoneWolf
                    ? 'drop-shadow(0 0 4px rgba(192,132,252,0.9))'
                    : 'drop-shadow(0 0 4px rgba(34,211,238,0.9))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-[10px] text-slate-400 leading-none">LVL</span>
              <span className="font-mono text-base font-bold text-white leading-tight">
                {level}
              </span>
            </div>
          </div>

          {/* Nickname, UID, and Region */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-bold text-white text-sm tracking-tight">
                {account.nickname || `Player_${account.uid.slice(0, 6)}`}
              </h3>
              <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-blue-500/20">
                {account.region || 'BD'}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="truncate">UID: {account.uid}</span>
              <button
                onClick={handleCopyUid}
                title="Copy UID"
                className="text-slate-500 hover:text-cyan-300 transition-colors shrink-0"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="shrink-0">
          {isInMatch ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-2.5 py-1 text-[11px] font-mono font-bold text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>⚔️ IN MATCH</span>
            </span>
          ) : isSearching ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-1 text-[11px] font-mono font-semibold text-purple-300 border border-purple-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
              <span>🔍 SEARCHING</span>
            </span>
          ) : isPaused ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/90 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-400 border border-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>⏸️ PAUSED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-mono font-semibold text-emerald-300 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>🟢 ONLINE</span>
            </span>
          )}
        </div>
      </div>

      {/* Mode Switcher Banner (BR vs LONE WOLF) */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-[#060a14]/90 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{isLoneWolf ? '🐺' : '🪂'}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-mono text-xs font-bold ${isLoneWolf ? 'text-purple-300' : 'text-blue-300'}`}>
                  {isLoneWolf ? 'LONE WOLF' : 'BATTLE ROYALE'}
                </span>
                {!isLoneWolfUnlocked && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    <Lock className="h-2.5 w-2.5" /> Forced Lvl 1–2
                  </span>
                )}
                {isLoneWolfUnlocked && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    <Unlock className="h-2.5 w-2.5" /> Lvl 3+ Unlocked
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                {level < 3 
                  ? 'Locked: Must reach Level 3 first in Battle Royale' 
                  : (isLoneWolf ? 'Fast Solo Matchmaking (Mode 43)' : 'Squad / Solo Battle Royale (Mode 1)')}
              </p>
            </div>
          </div>

          {/* Mode Switch Toggle Button */}
          <button
            onClick={handleToggleMode}
            disabled={!isLoneWolfUnlocked || modeLoading}
            title={
              !isLoneWolfUnlocked 
                ? 'Lone Wolf is locked! Account must reach Level 3 in Battle Royale first.' 
                : `Switch mode to ${isLoneWolf ? 'Battle Royale' : 'Lone Wolf'}`
            }
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold transition-all active:scale-95 ${
              !isLoneWolfUnlocked
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                : isLoneWolf
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30'
                : 'bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30'
            }`}
          >
            <Swords className="h-3 w-3" />
            <span>{isLoneWolf ? '⇄ Switch to BR' : '⇄ Switch to Lone Wolf'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: EXP, Matches, Likes */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl bg-[#080d17]/80 p-3 border border-slate-800/70">
        <div>
          <span className="block text-[10px] font-mono uppercase text-slate-500 font-semibold">
            Gained EXP
          </span>
          <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
            +{account.gained_exp.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase text-slate-500 font-semibold">
            Matches
          </span>
          <span className="font-mono text-sm font-bold text-indigo-300 tabular-nums">
            {account.matches_played || 0}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase text-slate-500 font-semibold">
            Likes
          </span>
          <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
            {account.likes || 0}
          </span>
        </div>
      </div>

      {/* Progress Bar to Next Level */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
          <span>Progress to Lvl {account.next_level || level + 1}: {progressPercent}%</span>
          {account.remaining_exp !== undefined ? (
            <span className="text-[11px] text-slate-500 tabular-nums">
              {account.remaining_exp.toLocaleString()} EXP needed
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 tabular-nums">
              {account.current_exp.toLocaleString()} EXP
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isLoneWolf
                ? 'bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Device Info & Operator Control Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs font-mono text-slate-400">
        <button
          onClick={() => onInspectDevice(account)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
          title="Inspect spoofed device hardware profile"
        >
          <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
          <span className="truncate max-w-[130px] sm:max-w-[160px]">
            {account.assigned_device?.brand || 'Spoofed'} {account.assigned_device?.model || 'Device'}
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Refresh / Sync Profile */}
          <button
            onClick={() => onRefresh(account.uid)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 hover:text-blue-200 transition-all active:scale-90"
            title="Sync latest level & EXP with Garena profile"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Restart Worker */}
          <button
            onClick={() => onRestart(account.uid)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600/20 hover:text-purple-200 transition-all active:scale-90"
            title="Restart worker loop"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Toggle Pause / Resume */}
          <button
            onClick={() => onToggleStatus(account.uid)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all active:scale-90 ${
              isPaused
                ? 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30'
                : 'bg-amber-600/15 border-amber-500/30 text-amber-400 hover:bg-amber-600/30'
            }`}
            title={isPaused ? 'Resume matchmaking' : 'Pause matchmaking'}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>

          {/* Delete Account */}
          <button
            onClick={() => onRemove(account.uid, account.auth_uid)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600/20 transition-all active:scale-90"
            title="Remove account from session"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
