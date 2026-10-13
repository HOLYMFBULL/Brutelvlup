import React, { useState } from 'react';
import { X, UserPlus, Key, FileCode, Check, AlertCircle, Swords } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (data: {
    uid?: string;
    password?: string;
    token?: string;
    nickname?: string;
    region?: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
}) => {
  const [tab, setTab] = useState<'guest' | 'token' | 'bulk'>('guest');
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [nickname, setNickname] = useState('');
  const [region, setRegion] = useState('BD');
  const [bulkJson, setBulkJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim() || !password.trim()) {
      setError('UID and Password are both required for Guest account.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await onAddAccount({
      uid: uid.trim(),
      password: password.trim(),
      nickname: nickname.trim() || undefined,
      region,
    });
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Account submitted to backend queue!');
      setTimeout(() => {
        setUid('');
        setPassword('');
        setNickname('');
        setSuccessMsg('');
        onClose();
      }, 1200);
    } else {
      setError(res.message || 'Failed to add account');
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Access token is required.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await onAddAccount({
      token: token.trim(),
      nickname: nickname.trim() || undefined,
      region,
    });
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Token worker initialized in backend!');
      setTimeout(() => {
        setToken('');
        setNickname('');
        setSuccessMsg('');
        onClose();
      }, 1200);
    } else {
      setError(res.message || 'Failed to add token');
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error('Root must be an array of accounts');
    } catch {
      setError('Invalid JSON. Must be an array, e.g. [{"uid": "...", "password": "..."}, ...]');
      return;
    }

    setLoading(true);
    let successCount = 0;
    for (const item of parsed) {
      if ((item.uid && item.password) || item.token) {
        const res = await onAddAccount({
          uid: item.uid ? String(item.uid).trim() : undefined,
          password: item.password ? String(item.password).trim() : undefined,
          token: item.token ? String(item.token).trim() : undefined,
          nickname: item.nickname,
          region: item.region || region,
        });
        if (res.success) successCount++;
      }
    }
    setLoading(false);
    setSuccessMsg(`Imported ${successCount} / ${parsed.length} accounts successfully!`);
    setTimeout(() => {
      setBulkJson('');
      setSuccessMsg('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-blue-900/50 bg-[#0a101d] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Backend Bot Account</h3>
              <p className="text-xs font-mono text-slate-400">
                Launches worker thread in Singapore Render container
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

        {/* Tab Strip */}
        <div className="mt-4 flex rounded-xl border border-slate-800 bg-[#080d17] p-1 text-xs font-mono">
          <button
            onClick={() => setTab('guest')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              tab === 'guest' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Guest (UID + Pass)
          </button>
          <button
            onClick={() => setTab('token')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              tab === 'token' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Auth Token
          </button>
          <button
            onClick={() => setTab('bulk')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              tab === 'bulk' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bulk JSON
          </button>
        </div>

        {/* Notification alerts */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-mono text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-300">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Mode Switch Notice */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Swords className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Mode Rule:</strong> Starts forcefully with 🪂 Battle Royale. Unlocks 🐺 Lone Wolf at Level 3!
          </span>
        </div>

        {/* Tab 1: Guest Login */}
        {tab === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="mt-4 space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Free Fire UID *</label>
              <input
                type="text"
                required
                value={uid}
                onChange={e => setUid(e.target.value)}
                placeholder="e.g. 8164540713"
                className="w-full rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Guest Password / Token Hash *</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Account password from guest.json"
                className="w-full rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nickname (Optional)</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Auto-fetched if blank"
                  className="w-full rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Region</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="BD">BD (Bangladesh)</option>
                  <option value="IND">IND (India)</option>
                  <option value="SG">SG (Singapore)</option>
                  <option value="TH">TH (Thailand)</option>
                  <option value="PH">PH (Philippines)</option>
                  <option value="VN">VN (Vietnam)</option>
                  <option value="ID">ID (Indonesia)</option>
                  <option value="BR">BR (Brazil)</option>
                  <option value="EU">EU (Europe)</option>
                  <option value="NA">NA (North America)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-600 px-5 py-2 font-bold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 disabled:opacity-50"
              >
                {loading ? 'Starting Worker...' : 'Launch Bot Worker'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Token Auth */}
        {tab === 'token' && (
          <form onSubmit={handleTokenSubmit} className="mt-4 space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Access Token *</label>
              <textarea
                required
                rows={3}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Paste Garena auth token (JWT / token string)..."
                className="w-full rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nickname (Optional)</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Auto-fetched"
                  className="w-full rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Region</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="BD">BD (Bangladesh)</option>
                  <option value="IND">IND (India)</option>
                  <option value="SG">SG (Singapore)</option>
                  <option value="TH">TH (Thailand)</option>
                  <option value="ID">ID (Indonesia)</option>
                  <option value="BR">BR (Brazil)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-600 px-5 py-2 font-bold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Launch Token Worker'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Bulk JSON */}
        {tab === 'bulk' && (
          <form onSubmit={handleBulkSubmit} className="mt-4 space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Paste Accounts JSON Array</label>
              <textarea
                required
                rows={6}
                value={bulkJson}
                onChange={e => setBulkJson(e.target.value)}
                placeholder='[
  {"uid": "8164540713", "password": "...", "region": "BD"},
  {"token": "ey..."}
]'
                className="w-full rounded-xl border border-slate-800 bg-[#080d17] px-3.5 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-600 px-5 py-2 font-bold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 disabled:opacity-50"
              >
                {loading ? 'Importing Batch...' : 'Import All Accounts'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
