import React from 'react';
import { BotAccount, DeviceProfile } from '../types';
import { Smartphone, X, Cpu, Monitor, Wifi, HardDrive, ShieldCheck } from 'lucide-react';

interface DeviceInspectorModalProps {
  account: BotAccount | null;
  onClose: () => void;
}

export const DeviceInspectorModal: React.FC<DeviceInspectorModalProps> = ({ account, onClose }) => {
  if (!account) return null;

  const device = account.assigned_device;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-blue-900/50 bg-[#0a101d] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hardware Fingerprint Inspector</h3>
              <p className="text-xs font-mono text-slate-400">
                Spoofed profile for {account.nickname} ({account.uid})
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
        {device ? (
          <div className="mt-5 space-y-4">
            {/* Device Identity */}
            <div className="rounded-xl border border-slate-800 bg-[#060a14] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-500">Device Model</span>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Spoof Active
                </span>
              </div>
              <div className="mt-1 text-lg font-bold text-white">
                {device.brand} {device.model}
              </div>
              <div className="mt-1 text-xs font-mono text-slate-400">
                {device.system_software}
              </div>
            </div>

            {/* Spec Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-slate-800/80 bg-[#060a14] p-3">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Monitor className="h-3.5 w-3.5 text-blue-400" />
                  <span>Display & Resolution</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {device.screen_width} × {device.screen_height}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  DPI: {device.screen_dpi}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#060a14] p-3">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                  <span>GPU Renderer</span>
                </div>
                <div className="text-sm font-bold text-white truncate" title={device.gpu_renderer}>
                  {device.gpu_renderer}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Hardware Accelerated
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#060a14] p-3">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <HardDrive className="h-3.5 w-3.5 text-purple-400" />
                  <span>RAM Memory</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {device.memory} MB
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {(device.memory / 1024).toFixed(1)} GB Available
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#060a14] p-3">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Simulated Client IP</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {device.client_ip}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Region: {account.region}
                </div>
              </div>
            </div>

            {/* Processor and Unique Identifier */}
            <div className="rounded-xl border border-slate-800/80 bg-[#060a14] p-3 text-xs font-mono">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                Processor Kernel Details
              </span>
              <p className="mt-1 text-slate-300 break-words">
                {device.processor_details}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-[#060a14] p-3 text-xs font-mono">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                Unique Device Token ID (devices.json)
              </span>
              <p className="mt-1 text-blue-400 break-all select-all">
                {device.unique_device_id}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs font-mono text-slate-400">
            No specific hardware device profile attached to this account.
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
