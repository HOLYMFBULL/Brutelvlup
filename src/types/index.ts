export interface DeviceProfile {
  unique_device_id: string;
  brand: string;
  model: string;
  gpu_renderer: string;
  system_software: string;
  screen_width: number;
  screen_height: number;
  screen_dpi: string;
  memory: number;
  processor_details: string;
  client_ip: string;
}

export type BotAccountStatus = 
  | 'ONLINE' 
  | 'IN_MATCH' 
  | 'SEARCHING' 
  | 'PAUSED' 
  | 'IDLE' 
  | 'AUTH_ERROR' 
  | 'STOPPED' 
  | 'EXP_CAPPED';

export type GameMode = 'BR' | 'LONE_WOLF';

export interface BotAccount {
  uid: string;
  auth_uid?: string;
  password?: string;
  token?: string;
  nickname: string;
  region: string;
  level: number;
  next_level?: number;
  mode?: GameMode;
  mode_label?: string;
  initial_exp: number;
  current_exp: number;
  gained_exp: number;
  remaining_exp?: number;
  target_exp?: number;
  needed_for_level?: number;
  earned_in_level?: number;
  progress_pct?: number;
  likes: number;
  status: BotAccountStatus | string;
  matches_played: number;
  active_matches: number;
  last_match_time: string | null;
  last_updated: string;
  is_paused?: boolean;
  uptime_seconds?: number;
  assigned_device?: DeviceProfile;
}

export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
  uid?: string;
}

export interface BotStats {
  total_accounts: number;
  total_matches: number;
  total_matches_started?: number;
  total_active_matches?: number;
  total_gained_exp: number;
  uptime: number; // in seconds
  active_workers: number;
  exp_rate_per_hour: number;
}

export interface ConnectionConfig {
  mode: 'render';
  backendUrl: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  latencyMs: number | null;
  lastChecked: number | null;
  errorMessage?: string;
}

export interface BotSettings {
  startMatchInterval: number; // default 15.0 seconds
  newMatchDelay: number; // default 3.0 seconds
  priorityRegions: string[];
  autoRestartOnError: boolean;
  maxConsecutiveFailures: number;
}
