// Mirrors backend root.controller ApiInfo
export interface ApiInfo {
  name: string;
  version: string;
  environment: string;
  timestamp: string;
}

// Mirrors backend health.controller HealthStatus
export interface HealthStatus {
  uptime: number;
  db: "connected" | "disconnected";
}
