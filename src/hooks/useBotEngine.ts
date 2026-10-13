import { useState, useEffect } from 'react';
import { botEngine } from '../services/botEngine';
import { BotAccount, LogEntry, BotStats, ConnectionConfig, BotSettings, GameMode } from '../types';

export function useBotEngine() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = botEngine.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    accounts: botEngine.getAccounts() as BotAccount[],
    logs: botEngine.getLogs() as LogEntry[],
    stats: botEngine.getStats() as BotStats,
    connection: botEngine.getConnection() as ConnectionConfig,
    settings: botEngine.getSettings() as BotSettings,
    
    // Backend API Actions
    addAccount: (data: { uid?: string; password?: string; token?: string; nickname?: string; region?: string }) => botEngine.addAccount(data),
    deleteAccount: (uid: string, authUid?: string) => botEngine.deleteAccount(uid, authUid),
    togglePauseAccount: (uid: string) => botEngine.togglePauseAccount(uid),
    togglePauseAll: () => botEngine.togglePauseAll(),
    refreshAccount: (uid: string) => botEngine.refreshAccount(uid),
    restartAccount: (uid: string) => botEngine.restartAccount(uid),
    setAccountMode: (uid: string, mode: GameMode) => botEngine.setAccountMode(uid, mode),
    clearLogs: () => botEngine.clearLogs(),
    pollBackend: () => botEngine.pollBackend(),
    setBackendUrl: (url: string) => botEngine.setBackendUrl(url),
    testConnection: (url: string) => botEngine.testConnection(url),
  };
}
