import React from 'react';
import { BotStats, ConnectionConfig } from '../types';
import { Server, Plus, Settings, Rocket, Terminal, Shield, Users, Globe } from 'lucide-react';

interface HeaderProps {
  activeTab: 'accounts' | 'logs' | 'devices' | 'deploy';
  setActiveTab: (tab: 'accounts' | 'logs' | 'devices' | 'deploy') => void;
  connection: ConnectionConfig;
  stats: BotStats;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  onOpenDeploy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  connection,
  stats,
  onOpenAddModal,
  onOpenSettings,
  onOpenDeploy,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-blue-900/40 bg-[#070b14]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap font-mono">
                SAITO <span className="text-cyan-400">CONTROL</span>
              </span>
              <span className="rounded-md bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-300 border border-cyan-500/20">
                v2.5 UDP
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Free Fire Level Up Bot & Multi-Account Cluster
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Accounts & EXP</span>
            <span className="ml-1 text-[11px] font-mono rounded px-1.5 py-0.2 bg-cyan-500/20 text-cyan-200">
              {stats.total_accounts}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Live Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'devices'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Device Profiles</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'deploy'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Rocket className="h-4 w-4 text-purple-400" />
            <span>Render Deploy</span>
          </button>
        </nav>

        {/* Zone 3: Connection Status & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Connection Pill */}
          <button
            onClick={onOpenSettings}
            title="Configure Render backend host or test ping"
            className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/90 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-cyan-500/40 transition-colors"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connection.status === 'connected'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : connection.status === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-400'
              }`}
            />
            <span className="hidden sm:inline">
              {connection.status === 'connected'
                ? 'Render (Singapore)'
                : connection.status === 'connecting'
                ? 'Connecting...'
                : 'Render Offline'}
            </span>
            {connection.latencyMs !== null && (
              <span className="text-[10px] text-cyan-300">
                {connection.latencyMs}ms
              </span>
            )}
            <Settings className="h-3.5 w-3.5 text-slate-400 hover:text-white" />
          </button>

          {/* Add Account CTA */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Strip */}
      <div className="flex md:hidden border-t border-slate-800/60 px-4 py-2 gap-2 overflow-x-auto bg-[#0a101d]">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            activeTab === 'accounts' ? 'bg-cyan-600/30 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          Accounts ({stats.total_accounts})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            activeTab === 'logs' ? 'bg-cyan-600/30 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          Live Logs
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            activeTab === 'devices' ? 'bg-cyan-600/30 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          Devices
        </button>
        <button
          onClick={() => setActiveTab('deploy')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            activeTab === 'deploy' ? 'bg-purple-600/30 text-purple-300 font-medium' : 'text-slate-400'
          }`}
        >
          Deploy Guide
        </button>
      </div>
    </header>
  );
};
