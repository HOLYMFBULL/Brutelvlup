import React from 'react';
import { INITIAL_DEVICES } from '../data/initialData';
import { Smartphone, ShieldAlert, Cpu, Monitor, Wifi, HardDrive } from 'lucide-react';

export const DeviceProfilesView: React.FC = () => {
  const devices = Object.entries(INITIAL_DEVICES);

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="rounded-2xl border border-blue-900/40 bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-transparent p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400 border border-blue-500/20 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Hardware Device Profiles & Anti-Detection Spoofing
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              To bypass Garena Free Fire multi-instance restrictions, each bot account is bound to a unique Android OEM hardware identity extracted into <code className="text-blue-300 font-mono">devices.json</code>. The Python engine wraps every protobuf UDP packet with the assigned screen DPI, GPU renderer, and client IP.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices.map(([uid, dev]) => (
          <div
            key={uid}
            className="rounded-2xl border border-slate-800 bg-[#0d1527]/90 p-5 transition-all hover:border-blue-600/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {dev.brand} {dev.model}
                  </h3>
                  <span className="font-mono text-xs text-slate-400">
                    UID: {uid}
                  </span>
                </div>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Active Profile
              </span>
            </div>

            <div className="mt-4 space-y-2 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800/80 py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Monitor className="h-3 w-3 text-blue-400" /> Resolution:
                </span>
                <span className="text-white font-medium">{dev.screen_width} × {dev.screen_height} ({dev.screen_dpi} DPI)</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-indigo-400" /> GPU:
                </span>
                <span className="text-white font-medium truncate max-w-[170px]" title={dev.gpu_renderer}>
                  {dev.gpu_renderer}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <HardDrive className="h-3 w-3 text-purple-400" /> Memory:
                </span>
                <span className="text-white font-medium">{dev.memory} MB RAM</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Wifi className="h-3 w-3 text-emerald-400" /> Client IP:
                </span>
                <span className="text-emerald-400 font-medium">{dev.client_ip}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Android Software</span>
              <p className="font-mono text-xs text-slate-400 mt-0.5 truncate">
                {dev.system_software}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
