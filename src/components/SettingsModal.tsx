import React, { useState } from 'react';
import { ConnectionConfig, BotSettings } from '../types';
import { X, Settings, Server, Check, AlertCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: ConnectionConfig;
  settings: BotSettings;
  onSetBackendUrl: (url: string) => void;
  onTestConnection: (url: string) => Promise<{ success: boolean; latency?: number; message?: string }>;
  onPollBackend: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  connection,
  onSetBackendUrl,
  onTestConnection,
  onPollBackend,
}) => {
  const [backendUrl, setBackendUrl] = useState(connection.backendUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latency?: number; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await onTestConnection(backendUrl);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    onSetBackendUrl(backendUrl);
    onPollBackend();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-blue-900/50 bg-[#0a101d] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Render Bot Gateway Link</h3>
              <p className="text-xs font-mono text-slate-400">
                Connects dashboard to your Render Web Service in Singapore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs font-mono">
          {/* Status Badge */}
          <div className="flex items-center justify-between rounded-xl bg-[#080d17] p-3 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  connection.status === 'connected'
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : connection.status === 'connecting'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-400'
                }`}
              />
              <span className="font-bold text-white uppercase">
                {connection.status === 'connected' ? 'Connected & Live' : connection.status}
              </span>
            </div>
            {connection.latencyMs !== null && (
              <span className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300">
                Ping: {connection.latencyMs}ms
              </span>
            )}
          </div>

          {/* Backend URL Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Render Web Service URL (Host)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={backendUrl}
                onChange={e => setBackendUrl(e.target.value)}
                placeholder="https://your-service-name.onrender.com"
                className="flex-1 rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !backendUrl}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-600/20 px-3.5 py-2 font-semibold text-cyan-300 hover:bg-cyan-600/30 disabled:opacity-50 transition-colors"
              >
                {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                <span>Test Ping</span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Paste the public URL from your Render dashboard (e.g. https://saito-freefire-bot.onrender.com).
            </p>
          </div>

          {/* Ping test results */}
          {testResult && (
            <div
              className={`rounded-xl border p-3 ${
                testResult.success
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {testResult.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>
                  {testResult.success
                    ? `Success! Socket gateway responsive (${testResult.latency}ms ping)`
                    : `Connection Error: ${testResult.message}`}
                </span>
              </div>
            </div>
          )}

          {/* Cloudflare Pages Proxy Note */}
          <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Singapore Region (SG-1)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When deployed on Render with region <code>singapore</code>, TCP and UDP packets route directly to Garena Free Fire Asian game servers with ultra-low latency.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 font-mono text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-cyan-600 px-5 py-2 font-mono text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 transition-all"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
