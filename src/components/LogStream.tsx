import React, { useState, useRef, useEffect } from 'react';
import { LogEntry, LogLevel } from '../types';
import { Terminal, Copy, Trash2, Check, ArrowDown, Search } from 'lucide-react';

interface LogStreamProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogStream: React.FC<LogStreamProps> = ({ logs, onClearLogs }) => {
  const [levelFilter, setLevelFilter] = useState<'all' | LogLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const streamEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesSearch =
      !searchQuery ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.uid && log.uid.includes(searchQuery));
    return matchesLevel && matchesSearch;
  });

  useEffect(() => {
    if (autoScroll && streamEndRef.current) {
      streamEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const handleCopy = () => {
    const text = filteredLogs
      .map(l => `[${l.time}] [${l.level.toUpperCase()}] ${l.uid ? `[${l.uid}] ` : ''}${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-blue-900/30 bg-[#080d17] p-4 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Live Telemetry & Socket Logs</h3>
          <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-400 border border-blue-500/20">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Level Filters & Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-800 bg-[#0a101d] p-1 text-xs">
            <button
              onClick={() => setLevelFilter('all')}
              className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors ${
                levelFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLevelFilter('info')}
              className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors ${
                levelFilter === 'info' ? 'bg-blue-500/30 text-blue-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setLevelFilter('success')}
              className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors ${
                levelFilter === 'success' ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setLevelFilter('warning')}
              className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors ${
                levelFilter === 'warning' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Warn
            </button>
            <button
              onClick={() => setLevelFilter('error')}
              className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors ${
                levelFilter === 'error' ? 'bg-rose-500/30 text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Error
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter logs..."
              className="w-32 sm:w-40 rounded-lg border border-slate-800 bg-slate-900/80 pl-7 pr-2.5 py-1 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Autoscroll button */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-mono transition-colors ${
              autoScroll
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}
            title="Toggle autoscroll to latest logs"
          >
            <ArrowDown className={`h-3 w-3 ${autoScroll ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Auto</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Clear */}
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 rounded-lg border border-rose-900/30 bg-rose-900/10 px-2 py-1 text-xs font-mono text-rose-400 hover:bg-rose-900/20 transition-colors"
            title="Clear log stream"
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="mt-3 h-[450px] overflow-y-auto rounded-xl bg-[#04070d] p-3 font-mono text-xs border border-blue-900/20 shadow-inner">
        {filteredLogs.length > 0 ? (
          <div className="space-y-1.5">
            {filteredLogs.map(log => {
              const levelColor =
                log.level === 'success'
                  ? 'text-emerald-400'
                  : log.level === 'warning'
                  ? 'text-amber-400'
                  : log.level === 'error'
                  ? 'text-rose-400'
                  : 'text-blue-400';

              const levelTag =
                log.level === 'success'
                  ? '[SUCCESS]'
                  : log.level === 'warning'
                  ? '[WARN]'
                  : log.level === 'error'
                  ? '[ERROR]'
                  : '[INFO]';

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2 py-0.5 leading-relaxed hover:bg-slate-900/50 rounded px-1.5 transition-colors"
                >
                  <span className="shrink-0 text-slate-500 tabular-nums">
                    [{log.time}]
                  </span>
                  <span className={`shrink-0 font-bold ${levelColor}`}>
                    {levelTag}
                  </span>
                  {log.uid && (
                    <span className="shrink-0 rounded bg-slate-800/80 px-1 text-[10px] text-blue-300">
                      UID:{log.uid}
                    </span>
                  )}
                  <span className="text-slate-300 break-words flex-1">
                    {log.message}
                  </span>
                </div>
              );
            })}
            <div ref={streamEndRef} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-slate-500">
            <p>No log records match the current filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
