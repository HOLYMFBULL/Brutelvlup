import React, { useState } from 'react';
import { X, Rocket, Server, Globe, Copy, Check, ExternalLink, ShieldCheck, Database } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectUrl?: (url: string) => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'render' | 'cloudflare' | 'd1'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copySnippet = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerfileSnippet = `# Render Dockerfile for SAITO Bot
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential gcc curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY UDP_LEAKED_BY_SAITO/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY UDP_LEAKED_BY_SAITO/ ./
EXPOSE 5000
CMD ["python", "main.py"]`;

  const renderYamlSnippet = `services:
  - type: web
    name: saito-freefire-bot
    env: docker
    dockerfilePath: Dockerfile
    plan: starter
    region: singapore
    healthCheckPath: /api/stats
    envVars:
      - key: PORT
        value: 5000
      - key: ACCOUNTS_FILE
        value: accounts.json`;

  const cfRedirectsSnippet = `# public/_redirects for Cloudflare Pages
/api/*  https://YOUR-APP.onrender.com/api/:splat  200
/*      /index.html                               200`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-blue-900/60 bg-[#080d17] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Render & Cloudflare Production Deployment Architecture
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Split-Hosting Topology: Python UDP Bot on Render + React Edge on Cloudflare Pages
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

        {/* Tab Navigation */}
        <div className="mt-4 flex border-b border-slate-800/80 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>Architecture & Topology</span>
          </button>
          <button
            onClick={() => setActiveTab('render')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'render'
                ? 'border-blue-500 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>Step 1: Render (Bot Backend)</span>
          </button>
          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'cloudflare'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Step 2: Cloudflare (Frontend)</span>
          </button>
          <button
            onClick={() => setActiveTab('d1')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'd1'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Step 3: Cloudflare D1 SQL</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 text-xs space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-900/40 bg-[#0e1726] p-4">
                <h3 className="font-bold text-white text-sm">Why this setup is the best choice:</h3>
                <ul className="mt-2 space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-emerald-400 font-bold">1.</span>
                    <span>
                      <strong className="text-white">Render Web Service (Docker):</strong> The Python bot needs 24/7 background execution to keep UDP game sockets open, renew Garena auth tokens, and run match loops every 15s. Serverless platforms (like AWS Lambda/Cloudflare Workers) timeout after seconds; Render runs continuously without execution cuts.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-emerald-400 font-bold">2.</span>
                    <span>
                      <strong className="text-white">Cloudflare Pages (React):</strong> Delivers your dashboard globally with 0ms cold starts, free DDoS mitigation, and custom domains.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-emerald-400 font-bold">3.</span>
                    <span>
                      <strong className="text-white">CORS Solution via <code className="text-blue-300 font-mono">_redirects</code>:</strong> Cloudflare automatically proxies <code className="text-blue-300 font-mono">/api/*</code> to Render. Your browser never gets cross-origin or mixed-content SSL blocks!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-emerald-400 font-bold">4.</span>
                    <span>
                      <strong className="text-white">Smart EXP Cap Watchdog:</strong> Automatically detects when Free Fire daily EXP limits are hit and pauses the worker so no CPU or server resources are wasted.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Topology Diagram Box */}
              <div className="rounded-xl border border-slate-800 bg-[#050811] p-4 font-mono text-[11px] text-slate-400">
                <div className="text-slate-300 font-bold mb-2">Request Lifecycle:</div>
                <div className="text-blue-400">
                  User Browser ──► Cloudflare Pages (https://trefguu.pages.dev)
                </div>
                <div className="text-emerald-400 pl-4">
                  ├──► Cloudflare D1 SQL (functions/api/accounts.ts) ──► Encrypted Account Credentials
                </div>
                <div className="text-purple-400 pl-4">
                  └── /api/control ──► Cloudflare Proxy (_redirects) ──► Render Backend (:5000)
                </div>
                <div className="text-blue-400 pl-8">
                  └── Render Python Worker (IDLE on boot, starts on operator command) ──► Free Fire Servers
                </div>
              </div>
            </div>
          )}

          {activeTab === 'render' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-[#0e1726] p-4">
                <h3 className="text-sm font-bold text-white">How to deploy the Python bot on Render</h3>
                <ol className="mt-2 list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Push your repository to GitHub.</li>
                  <li>Log in to <strong className="text-white">render.com</strong> and click <strong className="text-white">New +</strong> → <strong className="text-white">Web Service</strong>.</li>
                  <li>Select your repo and pick <strong className="text-white">Docker</strong> environment (using root <code className="text-blue-300 font-mono">Dockerfile</code>).</li>
                  <li>Select region <strong className="text-white">Singapore</strong> (closest to Garena Asian servers).</li>
                  <li>Add Health Check Path: <code className="text-blue-300 font-mono">/api/stats</code>.</li>
                  <li>Click <strong className="text-emerald-400 font-semibold">Deploy</strong>. Your URL will be: <code className="text-white font-mono">https://YOUR-APP.onrender.com</code></li>
                </ol>
              </div>

              {/* Dockerfile snippet */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Dockerfile (Already created in your root workspace):</span>
                  <button
                    onClick={() => copySnippet('dockerfile', dockerfileSnippet)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    {copiedKey === 'dockerfile' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'dockerfile' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="rounded-xl border border-slate-800 bg-[#050811] p-3 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {dockerfileSnippet}
                </pre>
              </div>

              {/* render.yaml snippet */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>render.yaml (Infrastructure as Code Blueprint):</span>
                  <button
                    onClick={() => copySnippet('renderyaml', renderYamlSnippet)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    {copiedKey === 'renderyaml' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'renderyaml' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="rounded-xl border border-slate-800 bg-[#050811] p-3 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {renderYamlSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'cloudflare' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-[#0e1726] p-4">
                <h3 className="text-sm font-bold text-white">How to deploy the React frontend on Cloudflare Pages</h3>
                <ol className="mt-2 list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>In Cloudflare dashboard, go to <strong className="text-white">Workers & Pages</strong> → <strong className="text-white">Create application</strong> → <strong className="text-white">Pages</strong>.</li>
                  <li>Connect your GitHub repository.</li>
                  <li>Set Build settings:
                    <div className="mt-1 ml-4 rounded bg-[#060a14] p-2 font-mono text-[11px] text-blue-300">
                      Framework preset: Vite<br />
                      Build command: npm run build<br />
                      Build output directory: dist
                    </div>
                  </li>
                  <li>In <code className="text-white font-mono">public/_redirects</code>, replace <code className="text-amber-300 font-mono">YOUR-APP.onrender.com</code> with your actual Render URL!</li>
                  <li>Click <strong className="text-emerald-400 font-semibold">Save and Deploy</strong>.</li>
                </ol>
              </div>

              {/* _redirects snippet */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>public/_redirects (Cloudflare API Proxy):</span>
                  <button
                    onClick={() => copySnippet('redirects', cfRedirectsSnippet)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    {copiedKey === 'redirects' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'redirects' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="rounded-xl border border-slate-800 bg-[#050811] p-3 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {cfRedirectsSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'd1' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-[#0e1726] p-4">
                <h3 className="text-sm font-bold text-white">Cloudflare D1 SQL Database Setup</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Run these 2 commands using Wrangler CLI to initialize the cloud database:
                </p>
                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">1. Create Database:</span>
                    <pre className="mt-1 rounded-lg bg-[#050811] p-2.5 font-mono text-[11px] text-emerald-400 border border-slate-800 flex justify-between items-center">
                      <code>npx wrangler d1 create saito_accounts_db</code>
                      <button
                        onClick={() => copySnippet('d1create', 'npx wrangler d1 create saito_accounts_db')}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        {copiedKey === 'd1create' ? 'Copied' : 'Copy'}
                      </button>
                    </pre>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">2. Apply Schema (schema.sql):</span>
                    <pre className="mt-1 rounded-lg bg-[#050811] p-2.5 font-mono text-[11px] text-emerald-400 border border-slate-800 flex justify-between items-center">
                      <code>npx wrangler d1 execute saito_accounts_db --file=schema.sql --remote</code>
                      <button
                        onClick={() => copySnippet('d1exec', 'npx wrangler d1 execute saito_accounts_db --file=schema.sql --remote')}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        {copiedKey === 'd1exec' ? 'Copied' : 'Copy'}
                      </button>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                <h4 className="text-sm font-bold text-emerald-300">Smart Daily EXP Cap Auto-Stop Watchdog</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The bot engine now monitors consecutive EXP checks. When an account hits the Free Fire daily match EXP limit (where matches yield 0 EXP), the engine immediately auto-stops the worker and sets the account badge to <strong className="text-amber-400">EXP CAPPED</strong>, saving server resources and preventing account flags.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Files already generated in workspace: Dockerfile, render.yaml, public/_redirects</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
