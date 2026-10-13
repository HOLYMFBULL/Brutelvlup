import { BotAccount, DeviceProfile, LogEntry, BotSettings } from '../types';

export const INITIAL_DEVICES: Record<string, DeviceProfile> = {
  "8164540713": {
    unique_device_id: "Google|faf0e319-a39d-4303-8c09-fd1cf87d2741",
    brand: "Vivo",
    model: "V2203",
    gpu_renderer: "Mali-G710",
    system_software: "Android OS 12 / API-31",
    screen_width: 1280,
    screen_height: 2400,
    screen_dpi: "372",
    memory: 3774,
    processor_details: "ARM64 FP ASIMD AES VMH | 2737 | 12",
    client_ip: "141.220.138.112"
  },
  "7911533659": {
    unique_device_id: "Google|f8411fbd-f051-4157-a21d-ef1ef5eaaeaf",
    brand: "OPPO",
    model: "CPH2611",
    gpu_renderer: "Adreno (TM) 720",
    system_software: "Android OS 14 / API-34",
    screen_width: 1080,
    screen_height: 2400,
    screen_dpi: "400",
    memory: 6114,
    processor_details: "ARM64 FP ASIMD AES VMH | 3131 | 12",
    client_ip: "164.237.136.184"
  },
  "7882140374": {
    unique_device_id: "Google|541b1bd1-ce7d-4f86-8d3f-58e899f4a6c1",
    brand: "Xiaomi",
    model: "2201122G",
    gpu_renderer: "Adreno (TM) 730",
    system_software: "Android OS 13 / API-33",
    screen_width: 720,
    screen_height: 2400,
    screen_dpi: "304",
    memory: 4586,
    processor_details: "ARM64 FP ASIMD AES VMH | 3154 | 12",
    client_ip: "206.240.14.191"
  },
  "4921405730": {
    unique_device_id: "Google|cd4cd692-2264-4c37-813a-6c0a61d89cb9",
    brand: "OnePlus",
    model: "CPH2451",
    gpu_renderer: "Adreno (TM) 740",
    system_software: "Android OS 13 / API-33",
    screen_width: 720,
    screen_height: 1600,
    screen_dpi: "404",
    memory: 3169,
    processor_details: "ARM64 FP ASIMD AES VMH | 2265 | 9",
    client_ip: "187.97.167.11"
  },
  "8095235402": {
    unique_device_id: "Google|61f7fcaa-6a72-4811-a191-8b37ad7e3b5b",
    brand: "Samsung",
    model: "SM-G998B",
    gpu_renderer: "Adreno (TM) 660",
    system_software: "Android OS 12 / API-31",
    screen_width: 1080,
    screen_height: 3200,
    screen_dpi: "480",
    memory: 7420,
    processor_details: "ARM64 FP ASIMD AES VMH | 3100 | 8",
    client_ip: "176.186.162.154"
  }
};

// Strict real backend mode: No static fake accounts in the frontend
export const INITIAL_ACCOUNTS: BotAccount[] = [];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: "log-init",
    time: "00:00:00",
    level: "info",
    message: "⚡ SAITO Control Panel initialized. Connecting to backend bot cluster..."
  }
];

export const INITIAL_SETTINGS: BotSettings = {
  startMatchInterval: 15.0,
  newMatchDelay: 3.0,
  priorityRegions: ["BD", "IND", "SG", "TH", "PH", "VN", "MY", "ID", "HK", "TW", "BR", "EU", "RU", "TR", "ME", "NA", "SAC", "US", "SSA"],
  autoRestartOnError: true,
  maxConsecutiveFailures: 5
};
