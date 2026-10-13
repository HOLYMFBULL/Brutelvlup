import React, { useState } from 'react';
import { BotAccount, GameMode } from '../types';
import { AccountCard } from './AccountCard';
import { Search, Filter, Plus, Users, ShieldAlert, Swords } from 'lucide-react';

interface AccountsListProps {
  accounts: BotAccount[];
  onToggleStatus: (uid: string) => void;
  onRefresh: (uid: string) => void;
  onRestart: (uid: string) => void;
  onInspectDevice: (account: BotAccount) => void;
  onRemove: (uid: string, authUid?: string) => void;
  onSetMode: (uid: string, mode: GameMode) => void;
  onOpenAddModal: () => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  onToggleStatus,
  onRefresh,
  onRestart,
  onInspectDevice,
  onRemove,
  onSetMode,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');

  // Extract unique regions
  const regions = ['ALL', ...Array.from(new Set(accounts.map(a => a.region))).filter(Boolean)];

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      (acc.nickname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.uid || '').includes(searchQuery);

    const matchesRegion = selectedRegion === 'ALL' || acc.region === selectedRegion;

    const isRunning = acc.status === 'ONLINE' || acc.status === 'IN_MATCH' || (typeof acc.status === 'string' && acc.status.startsWith('SEARCHING'));
    const isPaused = acc.is_paused || acc.status === 'PAUSED' || acc.status === 'STOPPED';

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isRunning) ||
      (statusFilter === 'PAUSED' && isPaused);

    return matchesSearch && matchesRegion && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by nickname or UID..."
            className="w-full rounded-xl border border-blue-900/40 bg-[#0d1527]/90 pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Region & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-[#0a101d] p-1 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({accounts.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('PAUSED')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === 'PAUSED' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Paused
            </button>
          </div>

          {/* Region Tabs */}
          {regions.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <Filter className="h-3.5 w-3.5 text-slate-500 ml-1 mr-0.5 shrink-0" />
              {regions.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                    selectedRegion === r
                      ? 'bg-blue-500/20 text-cyan-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid of Accounts */}
      {filteredAccounts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map(account => (
            <AccountCard
              key={account.uid}
              account={account}
              onToggleStatus={onToggleStatus}
              onRefresh={onRefresh}
              onRestart={onRestart}
              onInspectDevice={onInspectDevice}
              onRemove={onRemove}
              onSetMode={onSetMode}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-900/40 bg-gradient-to-b from-[#0a1222]/60 to-[#070b14]/80 py-16 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-white">No Backend-Verified Accounts Connected</h3>
          <p className="mt-2 text-xs text-slate-400 max-w-md leading-relaxed font-mono">
            Register your Free Fire Guest UID & Password or Access Token to launch automated TCP/UDP matchmaking.
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-900/80 px-4 py-2 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Swords className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Rule:</strong> Lvl 1–2 accounts start with 🪂 Battle Royale. Once Level 3 is reached, 🐺 Lone Wolf unlocks!
            </span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Player Account</span>
          </button>
        </div>
      )}
    </div>
  );
};
