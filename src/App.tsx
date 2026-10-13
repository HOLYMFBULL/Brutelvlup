import React, { useState } from 'react';
import { useBotEngine } from './hooks/useBotEngine';
import { BotAccount } from './types';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { AccountsList } from './components/AccountsList';
import { LogStream } from './components/LogStream';
import { DeviceProfilesView } from './components/DeviceProfilesView';
import { AddAccountModal } from './components/AddAccountModal';
import { DeviceInspectorModal } from './components/DeviceInspectorModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { SettingsModal } from './components/SettingsModal';
import { Smartphone, Monitor, Shield, Zap, Sparkles, Terminal, Swords } from 'lucide-react';

export default function App() {
  const {
    accounts,
    logs,
    stats,
    connection,
    settings,
    addAccount,
    deleteAccount,
    togglePauseAccount,
    togglePauseAll,
    refreshAccount,
    restartAccount,
    setAccountMode,
    clearLogs,
    pollBackend,
    setBackendUrl,
    testConnection,
  } = useBotEngine();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'accounts' | 'logs' | 'devices' | 'deploy'>('accounts');

  // Mobile Frame Preview mode toggle (desktop layout vs original mobile preview)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [inspectedAccount, setInspectedAccount] = useState<BotAccount | null>(null);

  return (
    <div className="min-h-screen bg-[#050811] text-[#e2e8f0] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connection={connection}
        stats={stats}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDeploy={() => setIsDeployOpen(true)}
      />

      {/* Mode Switcher & Cluster Status Bar */}
      <div className="border-b border-blue-950/40 bg-[#080d17]/80 px-4 py-2 text-xs font-mono">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-slate-300">
            <span
              className={`flex h-2 w-2 rounded-full ${
                connection.status === 'connected'
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : connection.status === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-400'
              }`}
            />
            <span className="truncate">
              {connection.status === 'connected'
                ? `⚡ Cluster Online: ${connection.backendUrl} (Singapore SG-1)`
                : `Connecting to Render cluster (${connection.backendUrl})...`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-lg border border-slate-800 bg-[#060a14] p-0.5">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-cyan-600/30 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Expanded Desktop Command View"
              >
                <Monitor className="h-3 w-3" />
                <span>Command Center</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-cyan-600/30 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Original Phone App View (templates/index.html style)"
              >
                <Smartphone className="h-3 w-3" />
                <span>Phone Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {viewMode === 'desktop' ? (
            /* ================= DESKTOP COMMAND CENTER VIEW ================= */
            <div className="space-y-6">
              {/* Telemetry Strip with Reactor Yield Dial */}
              <StatsCards
                stats={stats}
                accounts={accounts}
                onStartAll={togglePauseAll}
                onPauseAll={togglePauseAll}
                onSync={pollBackend}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />

              {/* Tab: Accounts & Level Up Manager */}
              {activeTab === 'accounts' && (
                <AccountsList
                  accounts={accounts}
                  onToggleStatus={togglePauseAccount}
                  onRefresh={refreshAccount}
                  onRestart={restartAccount}
                  onInspectDevice={acc => setInspectedAccount(acc)}
                  onRemove={deleteAccount}
                  onSetMode={setAccountMode}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              )}

              {/* Tab: Live Telemetry Logs */}
              {activeTab === 'logs' && (
                <LogStream logs={logs} onClearLogs={clearLogs} />
              )}

              {/* Tab: Device Fingerprints */}
              {activeTab === 'devices' && <DeviceProfilesView />}

              {/* Tab: Deployment & Cloudflare / Render Guide */}
              {activeTab === 'deploy' && (
                <div className="rounded-2xl border border-purple-900/40 bg-[#0d1527]/90 p-6 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Render & Cloudflare Hosting Setup
                      </h2>
                      <p className="text-xs font-mono text-slate-400">
                        Follow the steps below to host your bot 24/7 on Render (Singapore) and deliver the frontend via Cloudflare Pages.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDeployOpen(true)}
                      className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/20"
                    >
                      Open Interactive Deploy Drawer
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-[#060a14] p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                        <span className="rounded bg-cyan-500/20 p-1 text-cyan-400 font-mono text-xs">
                          STEP 1
                        </span>
                        <span>Render Web Service (Singapore)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        Dockerfile runs <code>python lc.py</code> on port 10000. Deploy with region <code>singapore</code> for direct sub-20ms ping to Free Fire BD/IND/SG servers.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-[#060a14] p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                        <span className="rounded bg-amber-500/20 p-1 text-amber-400 font-mono text-xs">
                          STEP 2
                        </span>
                        <span>Cloudflare Pages (Frontend)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        Cloudflare Pages serves your React frontend at <code>trefguu.pages.dev</code> with zero-latency global CDN edge caching.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= MOBILE PHONE PREVIEW MODE ================= */
            <div className="flex justify-center py-4">
              <div className="relative w-full max-w-[430px] rounded-[38px] border border-cyan-500/30 bg-[#080d17] shadow-2xl shadow-black overflow-hidden flex flex-col h-[820px]">
                {/* Mobile Top Appbar */}
                <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#080d17]/95 px-5 py-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-md shadow-cyan-500/30">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <h1 className="text-sm font-bold text-white">SAITO Control</h1>
                      <span className="font-mono text-[9px] text-cyan-400 font-semibold tracking-wider block">
                        FREE FIRE LEVEL UP
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>

                {/* Mobile Viewport Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Hero card */}
                  <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Verified Bots: {stats.active_workers}</span>
                      <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                        {stats.total_matches} MATCHES
                      </span>
                    </div>
                    <div className="mt-3 font-mono text-2xl font-bold text-emerald-400">
                      +{stats.total_gained_exp.toLocaleString()} EXP
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Rate: +{stats.exp_rate_per_hour.toLocaleString()} EXP/hr
                    </div>
                  </div>

                  {/* Active view inside phone */}
                  {activeTab === 'accounts' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span>Bot Accounts ({accounts.length})</span>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="text-cyan-400 text-xs font-mono hover:underline"
                        >
                          + Add
                        </button>
                      </div>
                      {accounts.length > 0 ? (
                        accounts.map(acc => (
                          <div
                            key={acc.uid}
                            className="rounded-xl border border-slate-800 bg-[#0d1527] p-3 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{acc.nickname}</span>
                                <span className="rounded bg-slate-800 px-1 text-[10px] text-cyan-300 font-mono">
                                  {acc.region}
                                </span>
                              </div>
                              <span
                                className={`font-mono text-[10px] font-bold ${
                                  acc.status === 'IN_MATCH'
                                    ? 'text-cyan-400 animate-pulse'
                                    : acc.status === 'ONLINE'
                                    ? 'text-emerald-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {acc.status}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-slate-400">
                              <span>LVL {acc.level}</span>
                              <span className="text-emerald-400">+{acc.gained_exp} EXP</span>
                              <span className="text-purple-300">{acc.mode === 'LONE_WOLF' ? '🐺 LONE WOLF' : '🪂 BR'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-slate-800 p-6 text-center text-slate-500 font-mono text-xs">
                          No backend accounts connected.
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'logs' ? (
                    <div className="rounded-xl bg-[#04070d] p-3 font-mono text-[10px] space-y-1.5 h-[500px] overflow-y-auto">
                      {logs.slice(0, 30).map(l => (
                        <div key={l.id} className="text-slate-300 break-words">
                          <span className="text-slate-500">[{l.time}]</span>{' '}
                          <span className="text-cyan-400 font-semibold">[{l.level}]</span> {l.message}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs font-mono text-slate-400">
                      Select Accounts or Logs tab below.
                    </div>
                  )}
                </div>

                {/* Mobile Bottom Tabbar */}
                <div className="grid grid-cols-3 border-t border-slate-800 bg-[#080d17] p-2 text-center text-xs font-mono">
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className={`py-2 ${activeTab === 'accounts' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}
                  >
                    Accounts
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`py-2 ${activeTab === 'logs' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}
                  >
                    Live Logs
                  </button>
                  <button
                    onClick={() => setIsDeployOpen(true)}
                    className="py-2 text-purple-400 font-bold"
                  >
                    Deploy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-[#060a14] py-4 text-center text-xs font-mono text-slate-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span>SAITO Control · AGS Community UDP Level Up Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDeployOpen(true)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Cloudflare & Render Docs
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Backend Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAccount={addAccount}
      />

      <DeviceInspectorModal
        account={inspectedAccount}
        onClose={() => setInspectedAccount(null)}
      />

      <DeployGuideModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        connection={connection}
        settings={settings}
        onSetBackendUrl={setBackendUrl}
        onTestConnection={testConnection}
        onPollBackend={pollBackend}
      />
    </div>
  );
}
