import { BotAccount, LogEntry, BotStats, ConnectionConfig, BotSettings, GameMode } from '../types';
import { INITIAL_DEVICES, INITIAL_SETTINGS } from '../data/initialData';

const STORAGE_KEYS = {
  ACCOUNTS: 'saito_bot_accounts_v2',
  SETTINGS: 'saito_bot_settings',
  CONNECTION: 'saito_connection_config',
  LOGS: 'saito_bot_logs_v2',
};

export class BotEngineService {
  private accounts: BotAccount[] = [];
  private logs: LogEntry[] = [];
  private settings: BotSettings = INITIAL_SETTINGS;
  private connection: ConnectionConfig = {
    mode: 'render',
    backendUrl: 'https://brutelvlup.onrender.com',
    status: 'connecting',
    latencyMs: null,
    lastChecked: null,
  };
  private startTime: number = Date.now();
  private totalMatches: number = 0;
  private totalMatchesStarted: number = 0;
  private totalActiveMatches: number = 0;
  private totalGainedExp: number = 0;
  private expPerHour: number = 0;
  private timer: number | null = null;
  private subscribers: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
    // Immediate initial sync
    this.pollBackend();
    // Regular polling loop every 3.5 seconds
    this.startPollingLoop();
  }

  private loadFromStorage() {
    try {
      // Purge any stale mock storage from previous versions
      localStorage.removeItem('saito_bot_accounts');

      const savedConn = localStorage.getItem(STORAGE_KEYS.CONNECTION);
      if (savedConn) {
        const parsed = JSON.parse(savedConn);
        if (parsed.backendUrl && !parsed.backendUrl.includes('saito-freefire-bot.onrender.com')) {
          this.connection.backendUrl = parsed.backendUrl;
        } else {
          this.connection.backendUrl = 'https://brutelvlup.onrender.com';
        }
      }

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch {
      // Fallback
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.CONNECTION, JSON.stringify(this.connection));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs.slice(-60)));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }

  public subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.saveToStorage();
    this.subscribers.forEach(cb => cb());
  }

  public getAccounts(): BotAccount[] {
    return this.accounts;
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public getSettings(): BotSettings {
    return this.settings;
  }

  public getConnection(): ConnectionConfig {
    return this.connection;
  }

  public getStats(): BotStats {
    const activeWorkers = this.accounts.filter(
      acc => acc.status === 'IN_MATCH' || acc.status === 'ONLINE' || (typeof acc.status === 'string' && acc.status.includes('SEARCHING'))
    ).length;

    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      total_accounts: this.accounts.length,
      total_matches: this.totalMatches,
      total_matches_started: this.totalMatchesStarted,
      total_active_matches: this.totalActiveMatches,
      total_gained_exp: this.totalGainedExp,
      uptime,
      active_workers: activeWorkers,
      exp_rate_per_hour: this.expPerHour
    };
  }

  public log(message: string, level: LogEntry['level'] = 'info', uid?: string) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toTimeString().split(' ')[0],
      level,
      message,
      uid
    };
    this.logs.unshift(entry);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
    this.notify();
  }

  public startPollingLoop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = window.setInterval(() => {
      this.pollBackend();
    }, 3500);
  }

  private getEffectiveUrl(path: string): string {
    const cleanBase = (this.connection.backendUrl || '').trim().replace(/\/$/, '');
    if (!cleanBase) return path;
    return `${cleanBase}${path}`;
  }

  public async pollBackend(): Promise<void> {
    const targets = [
      this.getEffectiveUrl('/api/stats'),
      '/api/stats' // Relative proxy fallback (Cloudflare _redirects)
    ];

    let lastError: Error | null = null;
    let successful = false;

    for (const url of targets) {
      if (!url) continue;
      try {
        const start = performance.now();
        const res = await fetch(url, {
          signal: AbortSignal.timeout(5000),
          headers: { 'Accept': 'application/json' }
        });
        const latency = Math.round(performance.now() - start);

        if (res.ok) {
          const data = await res.json();
          this.connection.status = 'connected';
          this.connection.latencyMs = latency;
          this.connection.lastChecked = Date.now();
          this.connection.errorMessage = undefined;

          // Hydrate real backend accounts
          if (Array.isArray(data.accounts)) {
            this.accounts = data.accounts.map((acc: BotAccount) => {
              // Assign known device profile if matching
              if (!acc.assigned_device && acc.uid && INITIAL_DEVICES[acc.uid]) {
                acc.assigned_device = INITIAL_DEVICES[acc.uid];
              }
              // Calculate level if missing
              if (!acc.level) acc.level = 1;
              // Format mode tags
              if (!acc.mode) {
                acc.mode = acc.level < 3 ? 'BR' : 'LONE_WOLF';
              }
              if (!acc.mode_label) {
                acc.mode_label = acc.level < 3 ? 'Battle Royale (Lvl < 3 enforced)' : (acc.mode === 'LONE_WOLF' ? 'Lone Wolf (Lvl 3+)' : 'Battle Royale');
              }
              return acc;
            });
          } else {
            this.accounts = [];
          }

          if (Array.isArray(data.logs)) {
            // Merge or assign backend logs
            this.logs = data.logs.map((l: any, idx: number) => ({
              id: `be-log-${idx}-${l.time || Date.now()}`,
              time: l.time || new Date().toTimeString().split(' ')[0],
              level: l.level || 'info',
              message: l.message || '',
              uid: l.uid ? String(l.uid) : undefined
            })).reverse();
          }

          if (data.total_matches !== undefined) {
            this.totalMatches = data.total_matches;
          }
          if (data.total_matches_started !== undefined) {
            this.totalMatchesStarted = data.total_matches_started;
          }
          if (data.total_active_matches !== undefined) {
            this.totalActiveMatches = data.total_active_matches;
          }
          if (data.total_gained_exp !== undefined) {
            this.totalGainedExp = data.total_gained_exp;
          }
          if (data.exp_per_hour !== undefined) {
            this.expPerHour = data.exp_per_hour;
          }

          successful = true;
          this.notify();
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!successful) {
      this.connection.status = 'error';
      this.connection.errorMessage = lastError?.message || 'Cannot reach Render backend';
      this.connection.lastChecked = Date.now();
      this.notify();
    }
  }

  public async testConnection(url: string): Promise<{ success: boolean; latency?: number; message?: string }> {
    try {
      const cleanUrl = url.trim().replace(/\/$/, '');
      const start = performance.now();
      const res = await fetch(`${cleanUrl}/api/stats`, {
        signal: AbortSignal.timeout(5000)
      });
      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        this.connection.backendUrl = cleanUrl;
        this.connection.status = 'connected';
        this.connection.latencyMs = latency;
        this.connection.lastChecked = Date.now();
        this.connection.errorMessage = undefined;
        await this.pollBackend();
        return { success: true, latency };
      }
      return { success: false, message: `Server replied with HTTP status ${res.status}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach host';
      return { success: false, message: msg };
    }
  }

  public setBackendUrl(url: string) {
    this.connection.backendUrl = url.trim().replace(/\/$/, '');
    this.connection.status = 'connecting';
    this.saveToStorage();
    this.pollBackend();
  }

  // --- Real Account Actions via Backend API ---

  public async addAccount(data: { uid?: string; password?: string; token?: string; nickname?: string; region?: string }): Promise<{ success: boolean; message?: string }> {
    try {
      const url = this.getEffectiveUrl('/api/account/add');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.status === 'ok') {
        this.log(`✓ Account ${data.uid || 'Token'} submitted to backend worker queue.`, 'success', data.uid);
        await this.pollBackend();
        return { success: true, message: json.message || 'Account added successfully' };
      }
      return { success: false, message: json.error || 'Failed to add account' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network request failed' };
    }
  }

  public async deleteAccount(uid: string, authUid?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const url = this.getEffectiveUrl('/api/account/delete');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, auth_uid: authUid || '' })
      });
      const json = await res.json();
      if (json.status === 'ok') {
        this.accounts = this.accounts.filter(a => a.uid !== uid);
        this.log(`🗑 Account ${uid} removed from backend bot session.`, 'warning', uid);
        await this.pollBackend();
        return { success: true };
      }
      return { success: false, message: json.error || 'Delete failed' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  public async togglePauseAccount(uid: string): Promise<{ success: boolean; isPaused?: boolean; message?: string }> {
    try {
      const url = this.getEffectiveUrl('/api/account/pause');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });
      const json = await res.json();
      if (json.status === 'ok') {
        this.log(`⏸ Pause toggled for UID ${uid}: ${json.is_paused ? 'PAUSED' : 'RESUMED'}`, 'info', uid);
        await this.pollBackend();
        return { success: true, isPaused: json.is_paused };
      }
      return { success: false, message: json.error };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  public async togglePauseAll(): Promise<{ success: boolean; allPaused?: boolean; message?: string }> {
    try {
      const url = this.getEffectiveUrl('/api/account/pause_all');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.status === 'ok') {
        this.log(`⏸ Batch pause toggle triggered: ${json.all_paused ? 'ALL PAUSED' : 'ALL RESUMED'}`, 'info');
        await this.pollBackend();
        return { success: true, allPaused: json.all_paused };
      }
      return { success: false, message: json.error };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  public async refreshAccount(uid: string): Promise<{ success: boolean; message?: string }> {
    try {
      const url = this.getEffectiveUrl('/api/account/refresh');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });
      const json = await res.json();
      if (json.status === 'ok') {
        this.log(`🔄 Profile synced with Garena API for UID ${uid}`, 'info', uid);
        await this.pollBackend();
        return { success: true };
      }
      return { success: false, message: json.error };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  public async restartAccount(uid: string): Promise<{ success: boolean; message?: string }> {
    try {
      const url = this.getEffectiveUrl('/api/account/restart');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });
      const json = await res.json();
      if (json.status === 'ok') {
        this.log(`🔁 Worker process restarted for UID ${uid}`, 'info', uid);
        await this.pollBackend();
        return { success: true };
      }
      return { success: false, message: json.error };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  public async setAccountMode(uid: string, mode: GameMode): Promise<{ success: boolean; mode?: GameMode; message?: string }> {
    try {
      const url = this.getEffectiveUrl('/api/account/mode');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, mode })
      });
      const json = await res.json();
      if (json.status === 'ok') {
        this.log(`🔄 Game mode for UID ${uid} switched to ${json.mode}`, 'success', uid);
        await this.pollBackend();
        return { success: true, mode: json.mode };
      }
      return { success: false, message: json.error || 'Failed to switch mode' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  public async clearLogs(): Promise<{ success: boolean }> {
    try {
      const url = this.getEffectiveUrl('/api/logs/clear');
      await fetch(url, { method: 'POST' });
    } catch {
      // Continue locally
    }
    this.logs = [];
    this.log('Log stream purged by operator.', 'info');
    return { success: true };
  }
}

export const botEngine = new BotEngineService();
